import * as React from "react";

import Highcharts from "highcharts/highmaps";
import HighchartsMap from "highcharts/modules/map";
import TiledWebMap from "highcharts/modules/tiledwebmap";
import HighchartsReact from "highcharts-react-official";

import { withRouteData } from "app/components/app-router";
import { dataBrowserApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { navigateByUrl } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";
import { ChelH3Cell, ChelMetric } from "publicGenerated/fetch";

// Named .json, not .geojson: resolveJsonModule handles .json natively, and adding a
// loader for a second extension is not worth it. Same convention as us_and_terr.json.
import chelGeometry from "assets/maps/chel_h3.json";

HighchartsMap(Highcharts);
TiledWebMap(Highcharts);

// Every metric in the delivery carries identical values for these (null_color, border_color,
// border_width, opacity, palette_type), so they live here rather than being repeated on all
// 40 rows of the API response.
const NULL_COLOR = "#D9D9D9";
const BORDER_COLOR = "#FFFFFF";
const BORDER_WIDTH = 0.3;
// Below 1 so the basemap's boundaries and labels stay legible through the hex layer, but not
// so low that the light end of the ramp disappears into the terrain. The delivered catalog
// specifies 0.95, which is near-opaque and buries the map entirely.
const FILL_OPACITY = 0.85;

// Sequential ramps keyed by the palette_name the catalog ships. Light-to-dark in every case.
// Severity direction is described by the data, not encoded by flipping the ramp.
// Each ramp starts at a tint with enough saturation to be distinguishable from the basemap
// and from the grey used for no-data. A near-white floor makes a real low value look like an
// absent cell, which is the one reading the map must never produce.
const PALETTES: Record<string, string[]> = {
  Blues: ["#C6DBEF", "#6BAED6", "#08519C"],
  Purples: ["#DADAEB", "#9E9AC8", "#54278F"],
  Greens: ["#C7E9C0", "#74C476", "#006D2C"],
  Oranges: ["#FDD0A2", "#FD8D3C", "#A63603"],
  Reds: ["#FCBBA1", "#FB6A4A", "#99000D"],
};
const DEFAULT_PALETTE = PALETTES.Blues;

// Display labels for metric_group, in sidebar order.
const GROUP_ORDER: Array<{ key: string; label: string }> = [
  { key: "pollution", label: "Air and pollution" },
  { key: "climate", label: "Climate and hazards" },
  { key: "built_environment", label: "Built environment" },
  { key: "sociodemographic", label: "Social and demographic" },
  { key: "health", label: "Health outcomes" },
];

// Bounds of the delivered cell set, used to fit the view rather than hardcoding a zoom.
// A fixed zoom is wrong the moment the panel changes width -- this adapts.
const CONUS_BOUNDS = {
  type: "MultiPoint",
  coordinates: [
    [-126.2, 23.2],
    [-65.9, 50.6],
  ],
};

// Quintile labels for the tooltip's position bar. Purely about magnitude -- deliberately not
// "better"/"worse", since severityDirection is unspecified for some metrics and inverted for
// others, and a value judgement in the tooltip would be wrong for both.
const QUINTILE_LABELS = ["Lowest", "Low", "Middle", "High", "Highest"];

const WRAPPER_OPEN =
  '<div style="width:260px;white-space:normal;word-break:break-word;' +
  'font-family:GothamBook,Arial,sans-serif">';

const tooltipHeader = (cellIndex: number) =>
  '<div style="font-size:15px;font-weight:600;color:#262262;' +
  'padding-bottom:6px;border-bottom:1px solid #E5E5E5">Hex ' +
  cellIndex +
  "</div>";

// The catalog's `unit` column is a value category ("value", "concentration", "risk"), not a
// display unit, so printing it raw puts the word "value" under a metric title. Only entries
// that read as real units are shown; everything else renders as a bare number, which is how
// most of these metrics are meant to appear. Percent is omitted because display_format
// already appends % to the values themselves.
//
// Diesel PM (E_DSLPM) is the one that genuinely wants a unit and has none in the delivery --
// add it here once CLAD supplies it.
const DISPLAY_UNITS: Record<string, string> = {
  days: "days",
  rank: "rank",
};

const styles = reactStyles({
  pageHeader: {
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingLeft: "18px",
    paddingRight: "18px",
    lineHeight: "1.5",
    fontSize: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "35px",
    margin: 0,
    fontFamily: "gothamBook",
  },
  homeButton: {
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "18px",
    color: "#262262",
    border: "1.5px solid #262262",
    borderRadius: "5px",
    background: "transparent",
    paddingTop: "0.1rem",
    paddingBottom: "0",
    paddingLeft: "0.4rem",
    paddingRight: "0.4rem",
    cursor: "pointer",
    textDecoration: "none",
  },
  layout: {
    display: "flex",
    alignItems: "flex-start",
    paddingLeft: "18px",
    paddingRight: "18px",
    paddingBottom: "18px",
  },
  sidebarColumn: {
    flex: "0 0 24rem",
    paddingRight: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  panel: {
    background: "#FFFFFF",
    border: "1px solid #DDE1E6",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  panelHeading: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#262262",
    marginBottom: "0.75rem",
  },
  scrollArea: {
    maxHeight: "36rem",
    overflowY: "auto",
    paddingRight: "0.25rem",
  },
  groupHeading: {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#6C6C6C",
    margin: "0.75rem 0 0.4rem",
  },
  card: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "#FFFFFF",
    border: "1px solid #DDE1E6",
    borderRadius: "6px",
    padding: "0.7rem 0.75rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
    font: "inherit",
  },
  cardSelected: {
    background: "#EDF3FB",
    border: "1px solid #216FB4",
  },
  cardTitle: {
    fontWeight: 600,
    color: "#302C71",
    marginBottom: "0.15rem",
  },
  cardUnit: {
    fontSize: "0.78rem",
    color: "#6C6C6C",
    marginBottom: "0.25rem",
  },
  cardDesc: {
    fontSize: "0.8rem",
    color: "#262262",
    lineHeight: 1.4,
  },
  downloadButton: {
    width: "100%",
    background: "#2F5CC5",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "6px",
    padding: "0.7rem",
    fontSize: "1rem",
    fontFamily: "GothamBook, Arial, sans-serif",
    cursor: "pointer",
  },
  mapPanel: {
    flex: "1 1 auto",
    minWidth: 0,
    position: "relative",
    background: "#FFFFFF",
    border: "1px solid #DDE1E6",
    borderRadius: "8px",
    overflow: "hidden",
  },
  chartWrap: {
    position: "relative",
  },
  chartOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.6)",
  },
  status: {
    padding: "1rem",
    color: "#262262",
  },
  note: {
    fontSize: "0.78rem",
    color: "#6C6C6C",
    padding: "0.5rem 1rem 0.75rem",
  },
});

interface Props {
  routeData?: any;
}

interface State {
  cells: ChelH3Cell[];
  metrics: ChelMetric[];
  selectedKey: string;
  values: number[];
  loading: boolean;
  loadingValues: boolean;
  error: string;
}

/**
 * CHEL public-tier environmental metrics as an H3 hex overlay on a tiled basemap.
 *
 * The catalog call returns the cell list once; each metric is then a bare array of values
 * positionally aligned to that list. Values are cached per metric key, so revisiting a
 * metric costs nothing.
 */
export const ChelMapReactComponent = withRouteData(
  class extends React.Component<Props, State> {
    /** metricKey -> values, so re-selecting a metric does not refetch. */
    valueCache: Record<string, number[]> = {};
    mounted = false;
    chartRef = React.createRef<HighchartsReact.RefObject>();

    constructor(props: Props) {
      super(props);
      this.state = {
        cells: [],
        metrics: [],
        selectedKey: "",
        values: [],
        loading: true,
        loadingValues: false,
        error: "",
      };
    }

    componentDidMount() {
      this.mounted = true;
      this.loadCatalog();
      window.addEventListener("resize", this.reflow);
    }

    componentWillUnmount() {
      this.mounted = false;
      window.removeEventListener("resize", this.reflow);
    }

    /**
     * Highcharts measures its container when the chart is created. The map lives in a flex
     * column that can still be settling at that moment, which leaves the chart sized to a
     * stale width -- tiles and legend draw, hexes do not. Reflowing once the layout has
     * settled fixes it, and the same handler covers window resizes.
     */
    reflow = () => {
      const chart = this.chartRef.current && this.chartRef.current.chart;
      if (chart) {
        chart.reflow();
      }
    };

    async loadCatalog() {
      try {
        const response = await dataBrowserApi().getChelMetrics();
        if (!this.mounted) {
          return;
        }
        const metrics = response.metrics || [];
        const selectedKey = metrics.length ? metrics[0].metricKey : "";
        this.setState(
          {
            cells: response.cells || [],
            metrics,
            selectedKey,
            loading: false,
          },
          () => selectedKey && this.loadValues(selectedKey)
        );
      } catch (e) {
        if (this.mounted) {
          this.setState({
            loading: false,
            error:
              "The environmental map data could not be loaded. Refresh to try again.",
          });
        }
      }
    }

    async loadValues(metricKey: string) {
      if (this.valueCache[metricKey]) {
        this.setState({
          values: this.valueCache[metricKey],
          loadingValues: false,
        });
        return;
      }
      this.setState({ loadingValues: true, error: "" });
      try {
        const response = await dataBrowserApi().getChelValues(metricKey);
        if (!this.mounted) {
          return;
        }
        const values = response.values || [];
        // Guard against a silent misalignment between the cell list and a values array.
        if (this.state.cells.length && values.length !== this.state.cells.length) {
          this.setState({
            loadingValues: false,
            error: "This metric could not be drawn because its data is incomplete.",
          });
          return;
        }
        this.valueCache[metricKey] = values;
        this.setState({ values, loadingValues: false }, () =>
          window.requestAnimationFrame(this.reflow)
        );
      } catch (e) {
        if (this.mounted) {
          this.setState({
            loadingValues: false,
            error:
              "This metric could not be loaded. Pick another, or refresh to try again.",
          });
        }
      }
    }

    selectMetric = (metricKey: string) => {
      this.setState({ selectedKey: metricKey }, () => this.loadValues(metricKey));
    };

    selectedMetric(): ChelMetric | undefined {
      return this.state.metrics.find(
        (m) => m.metricKey === this.state.selectedKey
      );
    }

    /**
     * The catalog ships display_format as a Python format string ("{:.1f}%"), which the
     * browser cannot apply. Only the trailing literal is useful; decimals come from
     * legendDecimals.
     */
    suffixOf(displayFormat: string): string {
      if (!displayFormat) {
        return "";
      }
      const closing = displayFormat.lastIndexOf("}");
      return closing === -1 ? "" : displayFormat.slice(closing + 1);
    }

    buildOptions(): Highcharts.Options {
      const metric = this.selectedMetric();
      const { cells, values } = this.state;
      if (!metric || !cells.length) {
        return {};
      }

      const ramp = PALETTES[metric.paletteName] || DEFAULT_PALETTE;
      const stops: Array<[number, string]> = ramp.map((color, i) => [
        i / (ramp.length - 1),
        color,
      ]);

      const data = cells.map((cell, i) => ({
        h3_id: cell.h3Id,
        cellIndex: cell.cellIndex,
        value: values[i] === undefined ? null : values[i],
      }));

      // Observed range and sorted values for the tooltip's position bar. Derived from the
      // array already in memory, so no extra request and no dependency on the catalog's
      // scale config -- which reports a raw_min of -999 wherever sentinels existed.
      const present = values.filter(
        (v) => v !== null && v !== undefined
      ) as number[];
      const sorted = [...present].sort((a, b) => a - b);
      const observedMin = sorted.length ? sorted[0] : null;
      const observedMax = sorted.length ? sorted[sorted.length - 1] : null;

      const fmt = (v: number) => v.toFixed(decimals) + suffix;

      /**
       * Share of cells with a strictly lower value, 0-1.
       *
       * Strictly-below rather than a midpoint or "at or below", because ties dominate some
       * metrics: 43% of E_OZONE cells are exactly 0.0. Any other rule puts the lowest value
       * in the data somewhere above the bottom of the scale, which reads as wrong however
       * defensible the statistics are. This way the minimum is always 0% and every cell
       * sharing a value gets the same label.
       *
       * The cost is that a large tie block leaves a gap -- for ozone the next distinct value
       * jumps straight to 43%, so nothing lands in the second fifth. That gap is real, and
       * showing it beats hiding it.
       */
      const rankOf = (v: number) => {
        let lo = 0;
        let hi = sorted.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (sorted[mid] < v) {
            lo = mid + 1;
          } else {
            hi = mid;
          }
        }
        return sorted.length ? lo / sorted.length : 0;
      };

      const suffix = this.suffixOf(metric.displayFormat);
      const decimals = metric.legendDecimals ?? 2;
      const title = metric.title;

      return {
        chart: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          height: 720,
          animation: false,
        },
        title: { text: undefined },
        credits: { enabled: false },
        // Tiles are Web Mercator, so the whole view has to be.
        mapView: {
          projection: { name: "WebMercator" },
          fitToGeometry: CONUS_BOUNDS as any,
        },
        mapNavigation: {
          enabled: true,
          enableDoubleClickZoomTo: true,
          buttonOptions: { verticalAlign: "top", align: "right" },
        },
        colorAxis: {
          // p05/p95, not the observed range: one extreme cell would otherwise flatten the
          // whole ramp into a single shade. The trade-off is that the top and bottom 5% of
          // cells clamp to the end colors -- visible on E_WLKIND, whose recommended range
          // covers 4.06-7.06 of an actual 1-11.98 spread.
          min: metric.minValue,
          max: metric.maxValue,
          stops,
          labels: {
            formatter: function () {
              return Number(this.value).toFixed(decimals) + suffix;
            },
          },
        },
        legend: {
          enabled: true,
          title: { text: title },
          align: "left",
          verticalAlign: "bottom",
          floating: true,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          symbolWidth: 240,
        },
        tooltip: {
          useHTML: true,
          headerFormat: "",
          borderWidth: 0,
          shadow: true,
          backgroundColor: "#FFFFFF",
          // Highcharts defaults the tooltip label to white-space: nowrap, which makes the
          // fixed-width wrapper below do nothing and runs the explanatory text off the edge.
          style: { whiteSpace: "normal" },
          // The map panel clips its overflow, so a tooltip near an edge would be cut off
          // unless it is rendered outside the chart container.
          outside: true,
          // Highcharts routes visible null points to nullFormatter; pointFormatter is never
          // called for them. Without this a no-data cell hovers to an empty tooltip box.
          nullFormatter: function () {
            const point: any = (this as any).point;
            return (
              WRAPPER_OPEN +
              tooltipHeader(point.cellIndex) +
              '<div style="padding-top:10px;color:#6C6C6C;line-height:1.45">' +
              "No data for " +
              title.toLowerCase() +
              " in this area." +
              "</div></div>"
            );
          },
          pointFormatter: function () {
            const point: any = this;
            const pct = Math.round(rankOf(point.value) * 100);
            const quintile =
              QUINTILE_LABELS[Math.min(4, Math.floor((pct / 100) * 5))];

            return (
              WRAPPER_OPEN +
              tooltipHeader(point.cellIndex) +
              // metric and value
              '<div style="display:flex;justify-content:space-between;' +
              'align-items:baseline;padding:8px 0 10px">' +
              '<span style="color:#216FB4;font-weight:600">' +
              title +
              "</span>" +
              '<span style="color:#262262;font-weight:600">' +
              fmt(point.value) +
              "</span></div>" +
              // position bar
              '<div style="position:relative;height:10px;border-radius:5px;' +
              "background:linear-gradient(to right,#F2F2F2,#9E9AC8,#54278F);" +
              'margin-bottom:4px">' +
              '<div style="position:absolute;top:-2px;left:calc(' +
              pct +
              '% - 7px);width:14px;height:14px;border-radius:7px;' +
              'background:#FFFFFF;border:2px solid #262262"></div>' +
              "</div>" +
              '<div style="display:flex;justify-content:space-between;' +
              'font-size:11px;color:#6C6C6C;padding-bottom:8px">' +
              "<span>Lowest</span><span>Highest</span></div>" +
              // explanation
              '<div style="font-size:11.5px;color:#216FB4;line-height:1.45">' +
              pct +
              "% of the " +
              sorted.length +
              " areas with data have a lower value. Across all areas, " +
              title.toLowerCase() +
              " ranges from " +
              (observedMin === null ? "-" : fmt(observedMin)) +
              " to " +
              (observedMax === null ? "-" : fmt(observedMax)) +
              ".</div>" +
              '<div style="font-size:11.5px;color:#216FB4;line-height:1.45;' +
              'padding-top:6px">' +
              "This area falls in the <b>" +
              quintile +
              "</b> fifth for " +
              title.toLowerCase() +
              ".</div>" +
              "</div>"
            );
          },
        },
        plotOptions: {
          map: {
            states: { hover: { borderColor: "#262262", borderWidth: 1 } },
            // Also set on the series below. Highcharts reads this from series.options at
            // hover time, but setting it only on the series can be missed when the chart is
            // patched via chart.update() rather than recreated.
            nullInteraction: true,
          },
        },
        series: [
          {
            type: "tiledwebmap",
            name: "Basemap",
            // Esri's topographic tiles carry state boundaries and place labels that survive
            // being seen through the hex layer. OSM Standard washes out at this zoom.
            provider: { type: "Esri", theme: "WorldTopoMap" },
            showInLegend: false,
          },
          {
            type: "map",
            name: title,
            mapData: chelGeometry as any,
            joinBy: ["h3_id", "h3_id"],
            data,
            nullColor: NULL_COLOR,
            // Off by default, which leaves no-data cells inert -- no hover, no tooltip. A
            // grey cell that does nothing reads as a rendering bug rather than as missing
            // data, so the tooltip has to be able to say which it is.
            nullInteraction: true,
            borderColor: BORDER_COLOR,
            borderWidth: BORDER_WIDTH,
            opacity: FILL_OPACITY,
            showInLegend: false,
          },
        ] as any,
      };
    }

    /**
     * Builds a CSV of the selected metric from data already in memory: one row per cell,
     * with the value blank where there is none. No round trip to the server.
     */
    downloadCurrent = () => {
      const metric = this.selectedMetric();
      const { cells, values } = this.state;
      if (!metric || !cells.length) {
        return;
      }
      const lines = ["h3_id,centroid_lat,centroid_lon," + metric.metricId];
      cells.forEach((cell, i) => {
        const v = values[i];
        lines.push(
          [
            cell.h3Id,
            cell.centroidLat,
            cell.centroidLon,
            v === null || v === undefined ? "" : v,
          ].join(",")
        );
      });
      const blob = new Blob([lines.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "chel_" + metric.metricKey + ".csv";
      link.click();
      URL.revokeObjectURL(url);
    };

    renderSidebar() {
      const { metrics, selectedKey } = this.state;
      const byGroup = GROUP_ORDER.map((group) => ({
        ...group,
        items: metrics
          .filter((m) => m.metricGroup === group.key)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      })).filter((group) => group.items.length > 0);

      return (
        <div style={styles.sidebarColumn}>
          <div style={styles.panel}>
            <div style={styles.panelHeading}>Environmental Factors</div>
            <div style={styles.scrollArea}>
              {byGroup.map((group) => (
                <div key={group.key}>
                  <div style={styles.groupHeading}>{group.label}</div>
                  {group.items.map((metric) => {
                    const selected = metric.metricKey === selectedKey;
                    return (
                      <button
                        key={metric.metricKey}
                        type="button"
                        aria-pressed={selected}
                        style={
                          selected
                            ? { ...styles.card, ...styles.cardSelected }
                            : styles.card
                        }
                        onClick={() => this.selectMetric(metric.metricKey)}
                      >
                        <div style={styles.cardTitle}>{metric.title}</div>
                        {DISPLAY_UNITS[metric.unit] && (
                          <div style={styles.cardUnit}>
                            {DISPLAY_UNITS[metric.unit]}
                          </div>
                        )}
                        <div style={styles.cardDesc}>
                          {metric.description} ({metric.metricId}, {metric.year})
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            style={styles.downloadButton}
            onClick={this.downloadCurrent}
          >
            Download Data
          </button>
        </div>
      );
    }

    render() {
      const { loading, loadingValues, error, metrics } = this.state;
      const metric = this.selectedMetric();

      return (
        <React.Fragment>
          <div style={styles.pageHeader}>
            <h1 style={styles.title}>Environmental Map</h1>
            <a onClick={() => navigateByUrl("")} style={styles.homeButton}>
              Home
            </a>
          </div>
          {loading && <Spinner />}
          {!loading && error && !metrics.length && (
            <div style={styles.status}>{error}</div>
          )}
          {!loading && metrics.length > 0 && (
            <div style={styles.layout}>
              {this.renderSidebar()}
              <div style={styles.mapPanel}>
                {error && <div style={styles.status}>{error}</div>}
                {!error && metric && (
                  <div style={styles.chartWrap}>
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={this.buildOptions()}
                      constructorType={"mapChart"}
                      ref={this.chartRef}
                      allowChartUpdate={true}
                      immutable={false}
                    />
                    {loadingValues && (
                      <div style={styles.chartOverlay}>
                        <Spinner />
                      </div>
                    )}
                  </div>
                )}
                <div style={styles.note}>
                  Each hexagon covers roughly 12,000 km². Values describe the area, not
                  any individual living in it. Grey hexagons have no data for the
                  selected metric.
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      );
    }
  }
);