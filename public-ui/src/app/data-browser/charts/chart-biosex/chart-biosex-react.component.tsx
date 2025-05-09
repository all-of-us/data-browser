import * as React from "react";
import * as highCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Component, Input, ViewEncapsulation } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import {
  GENDER_STRATUM_MAP,
  getBaseOptions,
} from "app/data-browser/charts/react-base-chart/base-chart.service";

interface State {
  options: any;
}

interface Props {
  genderAnalysis: any;
  genderCountAnalysis: any;
  selectedResult: any;
  domain: string;
}

export class BioSexChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { options: null };
  }

  componentDidMount() {
    this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.genderAnalysis !== this.props.genderAnalysis) {
      this.getChartOptions();
    }
  }

  getChartOptions() {
    const { domain } = this.props;
    if (domain === "fitbit") {
      this.getFitbitChartOptions();
    } else if (domain === "ehr") {
      this.getEhrChartOptions();
    } else {
      this.getSurveyChartOptions();
    }
  }

  setCommonBioSexOptions(analysisName: string, categories: any, series: any) {
    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = "column";
    newBaseOptions.plotOptions.column.groupPadding = 0.4;
    newBaseOptions.plotOptions.series.pointWidth = 50;
    newBaseOptions.legend.enabled = false;
    newBaseOptions.yAxis.gridLineColor = "#ECF1F4";
    newBaseOptions.title.style.color = "#262262";
    newBaseOptions.title.style.fontSize = "22px";
    newBaseOptions.color = "#2691D0";
    newBaseOptions.xAxis.title.text = "Sex";
    newBaseOptions.yAxis.title.text = "Participant Count";
    newBaseOptions.xAxis.categories = categories;
    if ("dataOnlyLT20" in series[0]) {
      newBaseOptions.yAxis.min = series[0].dataOnlyLT20 ? 20 : 0;
      newBaseOptions.yAxis.labels = {
        style: {
          fontSize: "14px",
          whiteSpace: "wrap",
          textOverflow: "ellipsis",
          color: "#262262",
        },
        formatter: function () {
          const label = this.axis.defaultLabelFormatter.call(this);
          // Change <= 20 count to display '<= 20'
          if (series[0].dataOnlyLT20 && label <= 20) {
            return "&#8804; 20";
          }
          return label;
        },
        useHTML: true,
      };
    }
    newBaseOptions.series = series;
    this.setState({ options: newBaseOptions });
  }

  getEhrChartOptions() {
    const {
      genderAnalysis: { analysisName, results },
    } = this.props;
    const { categories, series } =
      this.prepEhrOrSurveyCategoriesAndData(results);
    this.setCommonBioSexOptions(analysisName, categories, series);
  }

  getFitbitChartOptions() {
    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = "bar";
    newBaseOptions.plotOptions.series.pointWidth = 50;
    newBaseOptions.yAxis.title.text = "Participant Count";
    newBaseOptions.xAxis.title.text = "";
    newBaseOptions.yAxis.title.style.fontSize = "14px";
    newBaseOptions.xAxis.title.style.fontSize = "14px";
    newBaseOptions.yAxis.title.style.color = "#262262";
    newBaseOptions.yAxis.gridLineColor = "#F0F0F0";
    const { categories, data } = this.prepFitbitCategoriesAndData();
    newBaseOptions.xAxis.categories = categories;
    newBaseOptions.series[0].data = data;
    this.setState({ options: newBaseOptions });
  }

  getSurveyChartOptions() {
    const {
      genderAnalysis: { analysisName, results },
      selectedResult,
    } = this.props;
    const filteredResults = results.filter(
      (r) => r.stratum4 === selectedResult.stratum4
    );
    const { categories, series } =
      this.prepEhrOrSurveyCategoriesAndData(filteredResults);
    this.setCommonBioSexOptions(analysisName, categories, series);
  }

  prepEhrOrSurveyCategoriesAndData(genderAnalysisResults) {
    const {
      genderAnalysis: { analysisId },
      genderCountAnalysis: { results },
      domain,
    } = this.props;
    const data = [];
    const cats = [];
    const color = "#2691D0";
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of genderAnalysisResults) {
      // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
      const bsResult = results.filter(
        (x) =>
          (domain === "ehr" ? x.stratum4 : x.stratum2) ===
          (domain === "ehr" ? a.stratum2 : a.stratum5)
      )[0];
      const count =
        a.countValue <= 20 ? "&le; 20" : a.countValue.toLocaleString();
      const totalCount =
        bsResult.countValue <= 20
          ? "&le; 20"
          : bsResult.countValue.toLocaleString();
      if (a.analysisStratumName === null || !a.analysisStratumName) {
        a.analysisStratumName =
          GENDER_STRATUM_MAP[domain === "ehr" ? a.stratum2 : a.stratum5];
      }
      const analysisStratumName = a.analysisStratumName;
      const percentage = Number(
        ((a.countValue / bsResult.countValue) * 100).toFixed()
      );
      data.push({
        name: a.analysisStratumName,
        y: a.countValue,
        color: color,
        sliced: true,
        toolTipHelpText: this.getTooltipHelpText(
          count,
          analysisStratumName,
          percentage,
          totalCount,
          domain
        ),
        medicalConceptPercentage: percentage,
        analysisId: analysisId,
      });
      cats.push(a.analysisStratumName);
    }
    data.sort((a, b) => a.name.localeCompare(b.name));
    cats.sort();
    const dataOnlyLT20 = data.filter((x) => x.y > 20).length === 0;
    const series = [
      {
        color: color,
        legendColor: color,
        colorByPoint: false,
        data: data,
        dataOnlyLT20: dataOnlyLT20,
      },
    ];
    return { categories: cats, series: series };
  }

  getTooltipHelpText(
    count,
    analysisStratumName,
    percentage,
    totalCount,
    domain
  ) {
    const toolTipHelpText =
      '<div class="chart-tooltip age-tooltip">' +
      "<strong> " +
      count.toLocaleString() +
      "</strong> participants who had <strong>" +
      analysisStratumName +
      "</strong> as sex." +
      "</div>";
    return toolTipHelpText;
  }

  prepFitbitCategoriesAndData() {
    const {
      genderAnalysis: { results },
      genderCountAnalysis,
    } = this.props;
    const pointData = [];
    const categoryArr = [];
    for (const concept of results) {
      const genderCountResults = genderCountAnalysis.results.filter(
        (r) => r.stratum4 === concept.stratum2
      );
      let genderCountTooltip = "";
      let percentage;
      if (genderCountResults && genderCountResults.length > 0) {
        percentage = (
          (concept.countValue / genderCountResults[0].countValue) *
          100
        ).toFixed();
        if (percentage < 1) {
          percentage = (
            (concept.countValue / genderCountResults[0].countValue) *
            100
          ).toFixed(1);
        }
        const totCount =
          genderCountResults[0].countValue <= 20
            ? "&le; 20"
            : genderCountResults[0].countValue;
        genderCountTooltip += "Total Count = <strong>" + totCount + "</strong>";
      }
      const count =
        concept.countValue <= 20
          ? "&le; 20"
          : concept.countValue.toLocaleString();
      pointData.push({
        toolTipHelpText:
          '<div class="bio-sex-tooltip" style="white-space: normal; word-wrap: break-word; font-size: 14px; width: 30em;"><strong>' +
          count.toLocaleString() +
          "</strong>" +
          " participants who had <strong>" +
          concept.analysisStratumName +
          "</strong> as sex.</div>",
        name: concept.analysisStratumName,
        y: concept.countValue,
        concept: "",
        analysisId: "",
      });
      categoryArr.push(concept.analysisStratumName);
    }
    pointData.sort((a, b) => a.name.localeCompare(b.name));
    categoryArr.sort();
    return { categories: categoryArr, data: pointData };
  }

  render() {
    const { options } = this.state;
    return (
      <div>
        {options && (
          <HighchartsReact
            highcharts={highCharts}
            options={options}
            updateArgs={[true]}
          />
        )}
      </div>
    );
  }
}

@Component({
  selector: "app-biosex-chart-react",
  template: `<span #root></span>`,
  styleUrls: ["./chart-biosex.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class BioSexWrapperComponent extends BaseReactWrapper {
  @Input() genderAnalysis: any;
  @Input() genderCountAnalysis: any;
  @Input() selectedResult: any = null;
  @Input() domain: string;

  constructor() {
    super(BioSexChartReactComponent, [
      "genderAnalysis",
      "genderCountAnalysis",
      "selectedResult",
      "domain",
    ]);
  }
}
