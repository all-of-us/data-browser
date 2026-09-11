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
const BORDER_WIDTH = 0.1;
const FILL_OPACITY = 0.95;

// Sequential ramps keyed by the palette_name the catalog ships. Light-to-dark in every case.
// Severity direction is described by the data, not encoded by flipping the ramp.
const PALETTES: Record<string, string[]> = {
  Blues: ["#DEEBF7", "#6BAED6", "#08519C"],
  Purples: ["#EFEDF5", "#9E9AC8", "#54278F"],
  Greens: ["#E5F5E0", "#74C476", "#006D2C"],
  Oranges: ["#FEE6CE", "#FD8D3C", "#A63603"],
  Reds: ["#FEE0D2", "#FB6A4A", "#99000D"],
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

const CONUS_VIEW = { lat: 39.5, lng: -98.0, zoom: 3.4 };

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
    paddingLeft: "18px",
    paddingRight: "18px",
    alignItems: "stretch",
  },
  sidebar: {
    flex: "0 0 22rem",
    maxHeight: "44rem",
    overflowY: "auto",
    paddingRight: "1rem",
  },
  groupHeading: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#262262",
    margin: "1rem 0 0.5rem",
  },
  card: {
    width: "100%",
    textAlign: "left",
    background: "#FFFFFF",
    border: "1px solid #DDE1E6",
    borderRadius: "3px",
    padding: "0.75rem",
    marginBottom: "0.5rem",
    cursor: "pointer",
    font: "inherit",
  },
  cardSelected: {
    background: "#E9F1FA",
    border: "1px solid #216FB4",
  },
  cardTitle: {
    fontWeight: 600,
    color: "#302C71",
    marginBottom: "0.15rem",
  },
  cardUnit: {
    fontSize: "0.8rem",
    color: "#4A4A4A",
    marginBottom: "0.25rem",
  },
  cardDesc: {
    fontSize: "0.8rem",
    color: "#262262",
    lineHeight: 1.35,
  },
  mapPanel: {
    flex: "1 1 auto",
    minWidth: 0,
    position: "relative",
  },
  status: {
    padding: "1rem",
    color: "#262262",
  },
  note: {
    fontSize: "0.8rem",
    color: "#4A4A4A",
    marginTop: "0.5rem",
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
    }

    componentWillUnmount() {
      this.mounted = false;
    }

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
        this.setState({ values, loadingValues: false });
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
        value: values[i] === undefined ? null : values[i],
      }));

      const suffix = this.suffixOf(metric.displayFormat);
      const decimals = metric.legendDecimals ?? 2;
      const title = metric.title;

      return {
        chart: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          height: 640,
          animation: false,
        },
        title: { text: undefined },
        credits: { enabled: false },
        // Tiles are Web Mercator, so the whole view has to be.
        mapView: {
          projection: { name: "WebMercator" },
          center: [CONUS_VIEW.lng, CONUS_VIEW.lat],
          zoom: CONUS_VIEW.zoom,
        },
        mapNavigation: {
          enabled: true,
          enableDoubleClickZoomTo: true,
          buttonOptions: { verticalAlign: "top", align: "right" },
        },
        colorAxis: {
          // p05/p95, not the raw range: one extreme cell would otherwise flatten the
          // whole ramp into a single shade.
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
          pointFormatter: function () {
            const shown =
              this.value === null || this.value === undefined
                ? "No data"
                : Number(this.value).toFixed(decimals) + suffix;
            return (
              '<div style="text-align:center">' +
              '<div style="font-weight:600;margin-bottom:2px">' +
              title +
              "</div><div>" +
              shown +
              "</div></div>"
            );
          },
        },
        plotOptions: {
          map: {
            states: { hover: { borderColor: "#262262", borderWidth: 1 } },
          },
        },
        series: [
          {
            type: "tiledwebmap",
            name: "Basemap",
            provider: { type: "OpenStreetMap", theme: "Standard" },
            showInLegend: false,
          },
          {
            type: "map",
            name: title,
            mapData: chelGeometry as any,
            joinBy: ["h3_id", "h3_id"],
            data,
            nullColor: NULL_COLOR,
            borderColor: BORDER_COLOR,
            borderWidth: BORDER_WIDTH,
            opacity: FILL_OPACITY,
            showInLegend: false,
          },
        ] as any,
      };
    }

    renderSidebar() {
      const { metrics, selectedKey } = this.state;
      const byGroup = GROUP_ORDER.map((group) => ({
        ...group,
        items: metrics
          .filter((m) => m.metricGroup === group.key)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      })).filter((group) => group.items.length > 0);

      return (
        <aside style={styles.sidebar}>
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
                    {metric.unit && (
                      <div style={styles.cardUnit}>{metric.unit}</div>
                    )}
                    <div style={styles.cardDesc}>{metric.description}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
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
                {loadingValues && <Spinner />}
                {error && <div style={styles.status}>{error}</div>}
                {!loadingValues && !error && metric && (
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={this.buildOptions()}
                    constructorType={"mapChart"}
                    allowChartUpdate={true}
                    immutable={false}
                  />
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