import * as React from "react";
import * as highCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

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
  selectedGenotype: string;
  color: string;
}
// tslint:disable-next-line:no-empty-interface
interface State {
  options: any;
  selectedGenotype: string;
}

export class GenomicChartComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      options: null,
      selectedGenotype: props.selectedGenotype,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedGenotype !== this.state.selectedGenotype) {
      this.setState({ selectedGenotype: nextProps.selectedGenotype }, () => {this.dataToOptions();});
    }
  }

  dataToOptions() {
    const chartOptions = getGenomicOptions();
    const { selectedGenotype } = this.state;
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
    let participantTypeCount = 0;
    participantTypeCount = counts.results.filter((c) => c.stratum4 === selectedGenotype)[0].countValue;
    let selectedData: Array<any> = [];
    chartOptions.chart.type = data.chartType;
    chartOptions.xAxis.categories = [];
    chartOptions.xAxis.labels.style.width = "80%";

    chartOptions.column = {};
    data.results.forEach((result) => {
      if (GENDER_STRATUM_MAP[result.stratum2]) {
        result.stratum2 = GENDER_STRATUM_MAP[result.stratum2];
      } else if (AGE_STRATUM_MAP[result.stratum2]) {
        result.stratum2 = AGE_STRATUM_MAP[result.stratum2];
      }});
    let selectedResults = data.results.filter((r) => r.stratum4 === selectedGenotype);
    this.addMissingDemoResults(selectedResults, data.analysisId);
    selectedResults.forEach((result) => {
      const percent: any =
         (result.countValue / participantTypeCount) * 100;
      let resultText = result.countValue <= 20 ? "&le; 20" : result.countValue.toLocaleString();
      toolTipHelpText =
          `<strong>` +
          result.stratum2 +
          `</strong> <br> ` +
          resultText +
          `
                participants, ` +
          parseFloat(percent).toFixed(2) +
          `%`;
      if (result.stratum4 === selectedGenotype) {
        selectedData.push({
          cat: result.stratum2,
          y: result.countValue,
          toolTipHelpText: toolTipHelpText,
        });
        chartOptions.xAxis.categories.push(result.stratum2);
      }
    });
    // ordering the categories to match mockup
    chartOptions.xAxis.categories = chartOptions.xAxis.categories.sort(
      (a, b) => {
        const sortArr =
          data.analysisId === 3503 ? sortingDemoArr : sortingSexArr;
        return sortArr.indexOf(a) - sortArr.indexOf(b);
      }
    );
    selectedData = selectedData.sort((a, b) => {
      return (
        chartOptions.xAxis.categories.indexOf(a.cat) -
        chartOptions.xAxis.categories.indexOf(b.cat)
      );
    });
    chartOptions.series = [
      {
        name: selectedGenotype,
        data: selectedData,
        color: this.props.color,
      }
    ];
    this.setState({
      options: chartOptions,
    });
  }

  componentDidMount() {
    this.dataToOptions();
  }

  render() {
    const { options, selectedGenotype } = this.state;
    const { title,color } = this.props;
    let legendText = selectedGenotype;
    if (selectedGenotype === 'micro-array') {
        legendText = 'Genotyping Arrays';
    } else if (selectedGenotype === 'wgs_longread') {
        legendText = 'Long-Read WGS';
    } else if (selectedGenotype === 'wgs_shortread') {
        legendText = 'Short-Read WGS';
    } else if (selectedGenotype === 'wgs_structural_variants') {
        legendText = 'Short-Read WGS Structural Variants';
    }

    return (
      <div style={styles.chartContainer}>
        <div style={styles.legendLayout}>
          <h3 style={styles.chartTitle}>{title}</h3>
          <div style={styles.legend}>
            <FontAwesomeIcon icon={faCircle} style={{ color: color }} />{" "}
            <span style={styles.legendItem}>{legendText}</span>
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

  public addMissingDemoResults(results: any, analysisId) {
    const uniqueStratums: string[] = [];
    let fullStratums = [];
    if (analysisId === 3501) {
        fullStratums = ["Other", "Male", "Female"];
    } else {
        if (analysisId === 3502) {
            fullStratums = ['18-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '89+'];
        } else {
            fullStratums = ["White", "Asian", "Black, African American, or African", "Hispanic, Latino, or Spanish",
                "More than one race/ethnicity", "Other", "Prefer Not To Answer"];
        }
    }
    for (const result of results) {
      if (uniqueStratums.indexOf(result.stratum2) <= -1) {
        uniqueStratums.push(result.stratum2);
      }
    }
    const missingStratums = fullStratums.filter(
      (item) => uniqueStratums.indexOf(item) < 0
    );
    for (const missingStratum of missingStratums) {
      if (results.length > 0) {
        const missingResult = {
          analysisId: analysisId,
          countValue: 20,
          stratum1: results[0].stratum1,
          stratum2: missingStratum,
          stratum3: results[0].stratum3,
          stratum4: results[0].stratum4,
        };
        results.push(missingResult);
      }
    }
  }
}
