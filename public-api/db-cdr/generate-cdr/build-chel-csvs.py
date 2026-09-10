#!/usr/bin/env python3
"""
Transforms the four CHEL CSVs as delivered by CLAD into the three load-ready CSVs
consumed by both the canonical BigQuery dataset and the CloudSQL serving copy.

Doing the transform once, here, rather than twice (SQL in BigQuery, again for MySQL)
is what guarantees the two copies cannot drift.

Two output formats, because the two load paths disagree about NULLs:

  --format bq   (default) Header row, and cells with no data are OMITTED from
                chel_h3_metric_value rather than written as NULL. This is the format
                for db-cdr/generate-cdr/csv/, loaded by make-bq-data.sh with
                --skip_leading_rows=1 and then round-tripped through
                `bq extract` -> mysqlimport. That round trip writes NULL as an empty
                field, and mysqlimport turns an empty field in a DOUBLE column into 0,
                not NULL -- so a missing cell would silently become a real-looking zero.
                Omitting the row instead keeps the fact table sparse and relies on the
                values query LEFT JOINing from chel_h3_cell, which yields NULL in cell
                order without any null ever crossing a CSV boundary.

  --format mysql  No header, \\N for NULL, all rows present. For loading CloudSQL
                directly, bypassing BigQuery.

Usage:
  ./build-chel-csvs.py --src <dir with the 4 delivered CSVs> --out <output dir> [--format bq|mysql]
"""

import argparse
import csv
import json
import os
import sys

import pandas as pd

# Values the delivered fact table uses to mean "no data". These arrive with
# is_null='false' and are NOT reflected in the scale config's missing_count,
# so both have to be corrected here.
SENTINELS = {-999.0}


def read(src, name):
    # Files ship with a UTF-8 BOM and CRLF line endings.
    return pd.read_csv(os.path.join(src, name), encoding="utf-8-sig")


def metric_key(year, metric_id):
    """Metric ids are unique only within a vintage, so the key carries the year."""
    return "{}_{}".format(int(year), metric_id)


def nullable(v, fmt):
    """mysqlimport reads \\N as NULL; bq load reads an empty field as NULL."""
    if v is None or pd.isna(v):
        return "\\N" if fmt == "mysql" else ""
    return v


HEADERS = {
    "chel_h3_cell": ["h3_id", "cell_index", "resolution", "centroid_lat", "centroid_lon"],
    "chel_metric": ["metric_key", "metric_year", "metric_id", "title", "description",
                    "metric_group", "unit", "value_type", "higher_is_worse", "palette_name",
                    "reverse_palette", "legend_decimals", "display_format", "sort_order",
                    "min_value", "max_value", "p01", "p05", "p25", "p50", "p75", "p95", "p99",
                    "breaks_json", "non_missing_count", "missing_count"],
    "chel_h3_metric_value": ["metric_key", "h3_id", "metric_value"],
}


def build(src, out, fmt):
    geometry = read(src, "chel_h3_geometry.csv")
    catalog = read(src, "chel_metric_catalog.csv")
    scale = read(src, "chel_metric_scale_config.csv")
    fact = read(src, "chel_h3_metric_fact.csv")

    # ---- integrity checks: fail loudly rather than load a broken serving copy ----
    if len(catalog) != len(scale):
        sys.exit("catalog/scale row count mismatch: {} vs {}".format(len(catalog), len(scale)))
    if scale.scale_scope.nunique() != 1:
        sys.exit("scale config has more than one scope; the 1:1 fold-in is no longer valid")

    cat = catalog.merge(scale, on=["year", "metric_id"], how="inner", validate="one_to_one")
    if len(cat) != len(catalog):
        sys.exit("catalog/scale join is not 1:1")

    cells = sorted(geometry.h3_id.unique())
    expected = len(cells) * len(cat)
    if len(fact) != expected:
        sys.exit("fact table is not dense: {} rows, expected {}".format(len(fact), expected))

    orphan_cells = set(fact.h3_id) - set(cells)
    if orphan_cells:
        sys.exit("fact rows reference {} unknown cells".format(len(orphan_cells)))

    resolutions = set()
    try:
        import h3
        resolutions = {h3.get_resolution(c) for c in cells}
        if len(resolutions) != 1:
            sys.exit("mixed H3 resolutions in the cell list: {}".format(resolutions))
        if not all(h3.is_valid_cell(c) for c in cells):
            sys.exit("cell list contains invalid H3 ids")
    except ImportError:
        print("WARNING: h3 not installed, skipping cell validation", file=sys.stderr)

    resolution = resolutions.pop() if resolutions else 3

    # ---- chel_h3_cell ----
    # cell_index is the positional key every values array is aligned to. It is derived
    # from the sorted h3_id list so it is stable across reloads.
    geom = geometry.set_index("h3_id")
    cell_rows = []
    for i, h in enumerate(cells):
        g = geom.loc[h]
        cell_rows.append([h, i, resolution, g.centroid_lat, g.centroid_lon])

    # ---- chel_h3_metric_value, with sentinels converted to NULL ----
    fact = fact.copy()
    fact["metric_key"] = [metric_key(y, m) for y, m in zip(fact.year, fact.metric_id)]
    fact["clean_value"] = [None if v in SENTINELS else v for v in fact.metric_value]

    converted = int(fact.clean_value.isna().sum())
    print("converted {} sentinel value(s) to NULL".format(converted))

    value_rows = []
    omitted = 0
    for r in fact.sort_values(["metric_key", "h3_id"]).itertuples():
        if pd.isna(r.clean_value):
            if fmt == "bq":
                # Omit rather than write NULL -- see the module docstring. The values query
                # LEFT JOINs from chel_h3_cell, so an absent row still yields NULL in order.
                omitted += 1
                continue
            value_rows.append([r.metric_key, r.h3_id, "\\N"])
        else:
            value_rows.append([r.metric_key, r.h3_id, r.clean_value])
    if omitted:
        print("omitted {} row(s) with no data (bq format)".format(omitted))

    # Recount missing per metric from the cleaned data. The delivered scale config
    # reports missing_count=0 for every metric, which is wrong wherever sentinels exist.
    counts = fact.groupby("metric_key").clean_value.agg(
        non_missing=lambda s: int(s.notna().sum()),
        missing=lambda s: int(s.isna().sum()))

    # ---- chel_metric ----
    metric_rows = []
    for r in cat.sort_values(["year", "sort_order"]).itertuples():
        key = metric_key(r.year, r.metric_id)
        breaks = r.recommended_breaks_json
        if isinstance(breaks, str):
            # Normalise so the client can JSON.parse it without guessing.
            breaks = json.dumps(json.loads(breaks))
        else:
            breaks = None
        c = counts.loc[key] if key in counts.index else None
        metric_rows.append([
            key,
            int(r.year),
            r.metric_id,
            r.metric_title,
            r.metric_description,
            r.metric_group,
            r.unit,
            r.value_type,
            nullable(None if pd.isna(r.higher_is_worse) else int(bool(r.higher_is_worse)), fmt),
            r.palette_name,
            int(bool(r.reverse_palette)),
            int(r.legend_decimals),
            r.display_format,
            int(r.sort_order),
            nullable(r.recommended_min, fmt),
            nullable(r.recommended_max, fmt),
            nullable(r.p01, fmt), nullable(r.p05, fmt), nullable(r.p25, fmt), nullable(r.p50, fmt),
            nullable(r.p75, fmt), nullable(r.p95, fmt), nullable(r.p99, fmt),
            nullable(breaks, fmt),
            int(c.non_missing) if c is not None else nullable(None, fmt),
            int(c.missing) if c is not None else nullable(None, fmt),
        ])

    os.makedirs(out, exist_ok=True)
    for name, rows in [("chel_h3_cell", cell_rows),
                       ("chel_metric", metric_rows),
                       ("chel_h3_metric_value", value_rows)]:
        path = os.path.join(out, name + ".csv")
        with open(path, "w", newline="") as fh:
            w = csv.writer(fh, quoting=csv.QUOTE_MINIMAL, lineterminator="\n")
            if fmt == "bq":
                w.writerow(HEADERS[name])
            w.writerows(rows)
        print("wrote {} ({} rows)".format(path, len(rows)))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--src", required=True, help="directory holding the 4 delivered CSVs")
    p.add_argument("--out", required=True, help="directory to write the 3 load-ready CSVs")
    p.add_argument("--format", choices=["bq", "mysql"], default="bq",
                   help="bq: header, missing rows omitted. mysql: no header, \\N for NULL")
    args = p.parse_args()
    build(args.src, args.out, args.format)


if __name__ == "__main__":
    main()