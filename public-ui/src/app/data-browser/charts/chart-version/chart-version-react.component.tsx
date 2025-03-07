import * as React from "react";
import * as highCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import { Component, Input, ViewEncapsulation } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import {
  getBaseOptions,
  VERSION_NAME_MAP_COPE,
  VERSION_NAME_MAP_COPE_MINUTE,
  VERSION_STRATUM_MAP,
} from "app/data-browser/charts/react-base-chart/base-chart.service";

interface State {
  options: any;
}

interface Props {
  versionAnalysis: any;
  surveyVersionAnalysis: any;
  selectedResult: any;
  surveyConceptId: any;
}

export class VersionChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { options: null };
  }

  componentDidMount() {
    this.getChartOptions();
  }

  setChartOptions(
    analysisId: number,
    analysisName: string,
    categories: any,
    series: any
  ) {
    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = "column";
    newBaseOptions.plotOptions.column.groupPadding = 0.4;
    newBaseOptions.plotOptions.series.pointWidth = 50;
    newBaseOptions.legend.enabled = true;
    newBaseOptions.yAxis.gridLineColor = "#ECF1F4";
    newBaseOptions.title.style.color = "#262262";
    newBaseOptions.title.style.fontSize = "22px";
    newBaseOptions.color = "#2691D0";
    newBaseOptions.xAxis.title.text = analysisName;
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

  getChartOptions() {
    const {
      versionAnalysis: { analysisId, analysisName, results },
      selectedResult,
    } = this.props;
    const filteredResults = results.filter(
      (r) => r.stratum4 === selectedResult.stratum4
    );
    const { categories, series } = this.prepCategoriesAndData(filteredResults);
    this.setChartOptions(analysisId, analysisName, categories, series);
  }

  prepCategoriesAndData(genderAnalysisResults) {
    const {
      versionAnalysis: { analysisId },
      surveyVersionAnalysis,
      surveyConceptId,
    } = this.props;
    const data = [];
    const cats = [];
    const color = "#2691D0";
    genderAnalysisResults.sort((a, b) => {
      return (
        Number(VERSION_STRATUM_MAP[a.stratum7]) -
        Number(VERSION_STRATUM_MAP[b.stratum7])
      );
    });
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of genderAnalysisResults) {
      // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
      const count = a.countValue <= 20 ? "&le; 20" : a.countValue;
      let analysisStratumName = a.analysisStratumName;
      if (analysisStratumName === null) {
        analysisStratumName = VERSION_STRATUM_MAP[a.stratum7];
      }
      const version = surveyVersionAnalysis.filter(
        (va) => va.versionNum === a.stratum7
      )[0];
      const percentage = (
        (a.countValue / version.participants) *
        100
      ).toFixed();
      data.push({
        name: analysisStratumName,
        y: a.countValue,
        color: color,
        sliced: true,
        toolTipHelpText: this.getTooltipHelpText(
          a.stratum4,
          count,
          analysisStratumName,
          percentage,
          version
        ),
        version: a.stratum7,
        versionName:
          surveyConceptId === "1333342"
            ? VERSION_NAME_MAP_COPE[a.stratum7]
            : VERSION_NAME_MAP_COPE_MINUTE[a.stratum7],
        analysisId: analysisId,
      });
      cats.push(a.stratum7);
    }
    data.sort((a, b) => a.version - b.version);
    cats.sort();
    const dataOnlyLT20 = data.filter((x) => x.y > 20).length === 0;
    const series = [
      {
        color: color,
        legendColor: color,
        colorByPoint: false,
        data: data,
        dataOnlyLT20: dataOnlyLT20,
        showInLegend: false,
      },
    ];
    return {
      categories: cats.map((item) =>
        surveyConceptId === "1333342"
          ? VERSION_NAME_MAP_COPE[item]
          : VERSION_NAME_MAP_COPE_MINUTE[item]
      ),
      series: series,
    };
  }

  getTooltipHelpText(answer, count, analysisStratumName, percentage, version) {
    console.log('Here ???');
    return (
      '<div class="version-survey-tooltip" style="z-index: 180;"> <strong>' +
      answer +
      "</strong> <span>" +
      count +
      " participants </span>" +
      "<span><strong>" +
      percentage +
      "</strong>" +
      "% of all participants that took this version of survey</span>" +
      "<span> Total Count = <strong> " +
      version.participants +
      " </strong></span></div>"
    );
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
  selector: "app-version-chart-react",
  template: `<span #root></span>`,
  styleUrls: ["./../../chart/chart.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class VersionChartWrapperComponent extends BaseReactWrapper {
  @Input() versionAnalysis: any;
  @Input() surveyVersionAnalysis: any;
  @Input() selectedResult: any = null;

  constructor() {
    super(VersionChartReactComponent, [
      "versionAnalysis",
      "surveyVersionAnalysis",
      "selectedResult",
    ]);
  }
}
