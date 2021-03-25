import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { baseOptions, VERSION_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

interface State {
    options: any;
}

interface Props {
    versionAnalysis: any;
    surveyVersionAnalysis: any;
    selectedResult: any;
}

export class VersionChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  setChartOptions(analysisName: string, categories: any, series: any) {
      baseOptions.chart.type = 'column';
      baseOptions.plotOptions.column.groupPadding = 0.40;
      baseOptions.plotOptions.series.pointWidth = 50;
      baseOptions.legend.enabled = true;
      baseOptions.yAxis.gridLineColor = '#ECF1F4';
      baseOptions.title.style.color = '#262262';
      baseOptions.title.style.fontSize = '22px';
      baseOptions.color = '#2691D0';
      baseOptions.xAxis.title.text = analysisName;
      baseOptions.yAxis.title.text = 'Participant Count';
      baseOptions.xAxis.categories = categories;
      if ('dataOnlyLT20' in series[0]) {
        baseOptions.yAxis.min = series[0].dataOnlyLT20 ? 20 : 0;
        baseOptions.yAxis.labels = {
            style: {
                   fontSize: '14px',
                   whiteSpace: 'wrap',
                   textOverflow: 'ellipsis',
                   color: '#262262'
            },
            formatter: function () {
                   const label = this.axis.defaultLabelFormatter.call(this);
                   // Change <= 20 count to display '<= 20'
                   if (series[0].dataOnlyLT20 && label <= 20) {
                    return '&#8804; 20';
                   }
                   return label;
                   },
                   useHTML: true
            };
      }
      baseOptions.series = series;
  }

  getChartOptions() {
    const {versionAnalysis: {analysisName, results}, selectedResult} = this.props;
    const filteredResults = results.filter(
              r => r.stratum4 === selectedResult.stratum4);
    const {categories, series} = this.prepCategoriesAndData(filteredResults);
    this.setChartOptions(analysisName, categories, series);
    this.setState({options: baseOptions});
  }

  prepCategoriesAndData(genderAnalysisResults) {
    const {versionAnalysis: {analysisId}, surveyVersionAnalysis} = this.props;
    const data = [];
    const cats = [];
    const color = '#2691D0';
    genderAnalysisResults.sort((a, b) => {
          return Number(VERSION_STRATUM_MAP[a.stratum7]) - Number(VERSION_STRATUM_MAP[b.stratum7]);
        }
    );
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of genderAnalysisResults) {
          // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
          const count = (a.countValue <= 20) ? '&le; 20' : a.countValue;
          let analysisStratumName = a.analysisStratumName;
          if (analysisStratumName === null) {
           analysisStratumName = VERSION_STRATUM_MAP[a.stratum7];
          }

          const version = surveyVersionAnalysis.filter(va => va.monthName === a.stratum7)[0];
          const percentage = ((a.countValue / version.participants) * 100).toFixed();
          data.push({
            name: analysisStratumName,
            y: a.countValue,
            color: color,
            sliced: true,
            toolTipHelpText: this.getTooltipHelpText(a.stratum4, count, analysisStratumName, percentage,
            version),
            version: a.analysisStratumName,
            analysisId: analysisId
          });
          cats.push(a.stratum7);
        }
        const dataOnlyLT20 = data.filter(x => x.y > 20).length === 0;
        const series = [
          {
          color: color,
          legendColor: color,
          name: 'Survey Version Count',
          colorByPoint: false,
          data: data,
          dataOnlyLT20: dataOnlyLT20
          }];
        return { categories: cats, series: series};
  }

  getTooltipHelpText(answer, count, analysisStratumName, percentage, version) {
    return '<div class="version-survey-tooltip" style="z-index: 180;"> <strong>'
                       + answer + '</strong> <span>' + count +
                       ' participants </span>' +
                       '<span><strong>' + percentage + '</strong>' +
                       '% of all participants that took this version of survey</span>' +
                       '<span> Total Count = <strong> ' + version.participants +
                       ' </strong></span></div>';;
  }

  render() {
      const {options} = this.state;
      return <div>
        {options && <HighchartsReact highcharts={highCharts} options={options}
        updateArgs={[true]}/>}
      </div>;
    }
}

@Component({
  selector: 'app-version-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./../../chart/chart.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class VersionChartWrapperComponent extends BaseReactWrapper {
  @Input() versionAnalysis: any;
  @Input() surveyVersionAnalysis: any;
  @Input() selectedResult: any = null;

  constructor() {
    super(VersionChartReactComponent, ['versionAnalysis', 'surveyVersionAnalysis', 'selectedResult']);
  }
}
