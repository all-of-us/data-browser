import * as React from "react";
import * as highCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import {
  AGE_STRATUM_MAP,
  GENDER_STRATUM_MAP,
  getGenomicOptions,
} from "app/data-browser/charts/react-base-chart/base-chart.service";
import { reactStyles } from "app/utils";
import { Analysis } from "publicGenerated";

const styles = reactStyles({
  chartContainer: {
    background: "rgba(33,111,180,0.05)",
    padding: "1em",
    paddingTop: ".25em",
    marginBottom: "1em",
  },
  chartTitle: {
    fontSize: "1em",
    paddingBottom: ".5em",
  },
  legendLayout: {
    paddingBottom: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  legend: {
    display: "flex",
    alignItems: "center",
  },
  legendItem: {
    fontSize: ".6em",
    paddingRight: ".5rem",
    paddingLeft: ".25rem",
  },
});

// tslint:disable-next-line:no-empty-interface
interface Props {
  data: Analysis;
  counts: any;
  title: string;
}
// tslint:disable-next-line:no-empty-interface
interface State {
  options: any;
}

export class GenomicChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      options: null,
    };
  }

  dataToOptions() {
    const chartOptions = getGenomicOptions();
    const { data, counts } = this.props;
    let toolTipHelpText;
    const sortingDemoArr = [
      "White",
      "Asian",
      "Black, African American, or African",
      "Hispanic, Latino, or Spanish",
      "More than one race/ethnicity",
      "Other",
      "Prefer Not To Answer",
    ];
    const sortingSexArr = ["Female", "Male", "Other"];
    const participantTypeCount = {
      wsg: "",
      microArray: "",
    };
    counts.results.forEach((item) => {
      if (item.stratum4 === "wgs") {
        participantTypeCount.wsg = item.countValue;
      } else if (item.stratum4 === "micro-array") {
        participantTypeCount.microArray = item.countValue;
      }
    });
    let wgsData: Array<any> = [],
      microArrayData: Array<any> = [];
    chartOptions.chart.type = data.chartType;
    chartOptions.xAxis.categories = [];
    chartOptions.xAxis.labels.style = { width: "80%" };
    chartOptions.column = {};
    data.results.forEach((result) => {
      if (GENDER_STRATUM_MAP[result.stratum2]) {
        result.stratum2 = GENDER_STRATUM_MAP[result.stratum2];
      } else if (AGE_STRATUM_MAP[result.stratum2]) {
        result.stratum2 = AGE_STRATUM_MAP[result.stratum2];
      }
      if (result.stratum4 === "wgs") {
        const percent: any =
          (result.countValue / parseInt(participantTypeCount.wsg, 10)) * 100;
        toolTipHelpText =
          `<strong>` +
          result.stratum2 +
          `</strong> <br> ` +
          result.countValue.toLocaleString() +
          `
                participants, ` +
          parseFloat(percent).toFixed(2) +
          `%`;
        wgsData.push({
          cat: result.stratum2,
          y: result.countValue,
          toolTipHelpText: toolTipHelpText,
        });
      } else if (result.stratum4 === "micro-array") {
        const percent: any =
          (result.countValue / parseInt(participantTypeCount.microArray, 10)) *
          100;
        toolTipHelpText =
          `<strong>` +
          result.stratum2 +
          `</strong> <br> ` +
          result.countValue.toLocaleString() +
          `
                participants, ` +
          parseFloat(percent).toFixed(2) +
          `%`;
        chartOptions.xAxis.categories.push(result.stratum2);
        microArrayData.push({
          cat: result.stratum2,
          y: result.countValue,
          toolTipHelpText: toolTipHelpText,
        });
      }
    });
    // ordering the catigories to match mockup
    chartOptions.xAxis.categories = chartOptions.xAxis.categories.sort(
      (a, b) => {
        const sortArr =
          data.analysisId === 3503 ? sortingDemoArr : sortingSexArr;
        return sortArr.indexOf(a) - sortArr.indexOf(b);
      }
    );
    wgsData = wgsData.sort((a, b) => {
      return (
        chartOptions.xAxis.categories.indexOf(a.cat) -
        chartOptions.xAxis.categories.indexOf(b.cat)
      );
    });
    microArrayData = microArrayData.sort((a, b) => {
      return (
        chartOptions.xAxis.categories.indexOf(a.cat) -
        chartOptions.xAxis.categories.indexOf(b.cat)
      );
    });
    chartOptions.series = [
      {
        name: "wsg",
        data: wgsData,
        color: "#216FB4",
      },
      {
        name: "micro-array",
        data: microArrayData,
        color: "#8BC990",
      },
    ];
    this.setState({
      options: chartOptions,
    });
  }

  componentDidMount() {
    this.dataToOptions();
  }

  render() {
    const { options } = this.state;
    const { title } = this.props;
    return (
      <div style={styles.chartContainer}>
        <div style={styles.legendLayout}>
          <h3 style={styles.chartTitle}>{title}</h3>
          <div style={styles.legend}>
            <i className="fas fa-circle" style={{ color: "#216FB4" }}></i>{" "}
            <span style={styles.legendItem}>Whole Genome Sequencing</span>
            <i className="fas fa-circle" style={{ color: "#8BC990" }}></i>{" "}
            <span style={styles.legendItem}>Genotyping Arrays</span>
          </div>
        </div>
        {options && (
          <HighchartsReact
            allowChartUpdate="false"
            highcharts={highCharts}
            options={options}
          />
        )}
      </div>
    );
  }
}
