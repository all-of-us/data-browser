import * as React from "react";
import * as highCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { getBaseOptions } from "app/data-browser/charts/react-base-chart/base-chart.service";
import { reactStyles } from "app/utils";
import { CNCountEntry } from "publicGenerated";

const THEME_COLOR = "#262262";
const MAX_CN_BINS = 10;

const styles = reactStyles({
  chartContainer: {
    width: "100%",
  },
});

interface State {
  options: any;
}

interface Props {
  cnCounts: CNCountEntry[];
  loading?: boolean;
}

export class CNDistributionChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { options: null };
  }

  componentDidMount() {
    this.getChartOptions();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.cnCounts !== this.props.cnCounts) {
      this.getChartOptions();
    }
  }

  getChartData(): { categories: string[]; data: number[] } {
    const { cnCounts } = this.props;
    if (!cnCounts || cnCounts.length === 0) {
      return { categories: [], data: [] };
    }

    const categories: string[] = [];
    const data: number[] = [];

    for (let cn = 0; cn < MAX_CN_BINS; cn++) {
      categories.push(`${cn}`);
      const entry = cnCounts.find((e) => e.copyNumber === cn);
      data.push(entry ? (entry.sampleCount || 0) : 0);
    }

    const overflow = cnCounts
      .filter((e) => (e.copyNumber || 0) >= MAX_CN_BINS)
      .reduce((sum, e) => sum + (e.sampleCount || 0), 0);

    if (overflow > 0 || cnCounts.some((e) => (e.copyNumber || 0) >= MAX_CN_BINS)) {
      categories.push("\u226510");
      data.push(overflow);
    }

    return { categories, data };
  }

  getChartOptions() {
    const { cnCounts } = this.props;
    if (!cnCounts || cnCounts.length === 0) {
      this.setState({ options: null });
      return;
    }

    const { categories, data } = this.getChartData();
    if (categories.length === 0) {
      this.setState({ options: null });
      return;
    }

    const maxVal = Math.max(...data);

    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = "column";
    newBaseOptions.chart.height = 280;

    newBaseOptions.title.useHTML = true;
    newBaseOptions.title.text =
      '<div style="color:#262262;text-align:center;font-size:12px;">COPY NUMBER DISTRIBUTION</div>';
    newBaseOptions.title.align = "center";
    newBaseOptions.title.style = {
      color: THEME_COLOR,
      fontSize: "12px",
      fontFamily: "GothamBook, Arial, Helvetica, sans-serif",
      fontWeight: "normal",
    };

    newBaseOptions.xAxis = {
      categories: categories,
      title: { text: null },
      labels: {
        style: {
          color: THEME_COLOR,
          fontSize: "10px",
          fontFamily: "GothamBook, Arial, Helvetica, sans-serif",
        },
      },
      lineColor: THEME_COLOR,
      tickColor: THEME_COLOR,
    };

    newBaseOptions.yAxis = {
      title: { text: null },
      labels: {
        style: {
          color: THEME_COLOR,
          fontSize: "10px",
          fontFamily: "GothamBook, Arial, Helvetica, sans-serif",
        },
      },
      gridLineColor: "#E0E0E0",
      lineColor: THEME_COLOR,
      lineWidth: 1,
    };

    newBaseOptions.legend = { enabled: false };

    newBaseOptions.tooltip.outside = true;
    newBaseOptions.tooltip.useHTML = true;
    newBaseOptions.tooltip.shared = true;
    newBaseOptions.tooltip.backgroundColor = "#FFFFFF";
    newBaseOptions.tooltip.borderColor = "#E0E0E0";
    newBaseOptions.tooltip.borderRadius = 4;
    newBaseOptions.tooltip.borderWidth = 1;
    newBaseOptions.tooltip.shadow = true;
    newBaseOptions.tooltip.style = {
      color: THEME_COLOR,
      whiteSpace: "nowrap",
      zIndex: 9998,
    };
    newBaseOptions.tooltip.formatter = function () {
      // Use the visible series data, not the invisible hitarea series
      const visiblePoint = this.points?.find(
        (p: any) => p.series.name === "Samples"
      );
      if (!visiblePoint) {
        return false;
      }
      return (
        '<div style="text-align:center;font-family:GothamBook,Arial,sans-serif;font-size:14px;">' +
        "<strong>CN=" +
        visiblePoint.x +
        "</strong>: " +
        visiblePoint.y.toLocaleString() +
        " samples</div>"
      );
    };

    newBaseOptions.plotOptions = {
      column: {
        borderColor: THEME_COLOR,
        borderWidth: 1.5,
        pointPadding: 0,
        groupPadding: 0.05,
        stacking: "normal",
      },
    };

    newBaseOptions.series = [
      {
        name: "_hitarea",
        data: data.map((v) => maxVal - v),
        color: "rgba(0,0,0,0)",
        borderWidth: 0,
        showInLegend: false,
        enableMouseTracking: true,
        states: {
          hover: {
            color: "rgba(0,0,0,0)",
          },
        },
      },
      {
        name: "Samples",
        data: data,
        color: "#FFFFFF",
        showInLegend: false,
        states: {
          hover: {
            color: THEME_COLOR,
            borderColor: THEME_COLOR,
          },
        },
      },
    ];

    this.setState({ options: newBaseOptions });
  }

  render() {
    const { loading } = this.props;
    const { options } = this.state;

    if (loading || !options) {
      return null;
    }

    return (
      <div style={styles.chartContainer}>
        <HighchartsReact
          highcharts={highCharts}
          options={options}
          updateArgs={[true]}
        />
      </div>
    );
  }
}