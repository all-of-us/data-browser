import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { baseOptions, GENDER_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

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
    this.state = {options: null};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  getChartOptions() {
    const {domain} = this.props;
    if (domain === 'fitbit') {
        this.getFitbitChartOptions();
    } else if (domain === 'ehr') {
        this.getEhrChartOptions();
    } else {
        this.getSurveyChartOptions();
    }
  }

  setCommonBioSexOptions(analysisName: string, categories: any, series: any) {
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
                   if (label <= 20) {
                    return '&#8804; 20';
                   }
                   return label;
                   },
                   useHTML: true
            };
      }
      baseOptions.series = series;
  }

  getEhrChartOptions() {
    const {genderAnalysis: {analysisName, results}} = this.props;
    const {categories, series} = this.prepEhrOrSurveyCategoriesAndData(results);
    this.setCommonBioSexOptions(analysisName, categories, series);
    this.setState({options: baseOptions});
  }

  getFitbitChartOptions() {
    baseOptions.chart.type = 'bar';
    baseOptions.plotOptions.series.pointWidth = 50;
    baseOptions.yAxis.title.text = 'Participant Count';
    baseOptions.xAxis.title.text = '';
    baseOptions.yAxis.title.style.fontSize = '14px';
    baseOptions.xAxis.title.style.fontSize = '14px';
    baseOptions.yAxis.title.style.color = '#262262';
    baseOptions.yAxis.gridLineColor = '#F0F0F0';
    const {categories, data} = this.prepFitbitCategoriesAndData();
    baseOptions.xAxis.categories = categories;
    baseOptions.series[0].data = data;
    this.setState({options: baseOptions});
  }

  getSurveyChartOptions() {
    const {genderAnalysis: {analysisName, results}, selectedResult} = this.props;
    const filteredResults = results.filter(
              r => r.stratum4 === selectedResult.stratum4);
    const {categories, series} = this.prepEhrOrSurveyCategoriesAndData(filteredResults);
    this.setCommonBioSexOptions(analysisName, categories, series);
    this.setState({options: baseOptions});
  }

  prepEhrOrSurveyCategoriesAndData(genderAnalysisResults) {
    const {genderAnalysis: {analysisId}, genderCountAnalysis: {results}, domain} = this.props;
    const data = [];
    const cats = [];
    const color = '#2691D0';
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of genderAnalysisResults) {
          // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
          const bsResult = results.filter(x => (domain === 'ehr' ? x.stratum4 : x.stratum2) ===
          (domain === 'ehr' ? a.stratum2 : a.stratum5))[0];
          const count = (a.countValue <= 20) ? '&le; 20' : a.countValue;
          const totalCount = (bsResult.countValue <= 20) ? '&le; 20'
          : bsResult.countValue.toLocaleString();
          if (a.analysisStratumName === null) {
           a.analysisStratumName = GENDER_STRATUM_MAP[(domain === 'ehr' ? a.stratum2 : a.stratum5)];
          }
          const analysisStratumName = a.analysisStratumName;
          const percentage = Number(((a.countValue / bsResult.countValue) * 100).toFixed());
          data.push({
            name: a.analysisStratumName,
            y: a.countValue,
            color: color,
            sliced: true,
            toolTipHelpText: this.getTooltipHelpText(count, analysisStratumName, percentage,
            totalCount, domain),
            medicalConceptPercentage: percentage,
            analysisId: analysisId
          });
          cats.push(a.analysisStratumName);
        }
        data.sort((a, b) => a.name.localeCompare(b.name));
        cats.sort();
        const dataOnlyLT20 = data.filter(x => x.y > 20).length === 0;
        const series = [
          {
          color: color,
          legendColor: color,
          name: 'Sex Assigned At Birth, Selected Answered Count',
          colorByPoint: false,
          data: data,
          dataOnlyLT20: dataOnlyLT20
          }];
        return { categories: cats, series: series};
  }

  getTooltipHelpText(count, analysisStratumName, percentage, totalCount, domain) {
    const toolTipHelpText = '<div class="chart-tooltip">' +
        '<strong> ' + count + '</strong> participants had ' + analysisStratumName +
        ' as sex assigned at birth with this ' +
        (domain === 'ehr' ? 'medical concept mentioned in their Electronic Health Record (EHR)' : 'survey answer') + ' and that is ' +
        '<strong>' + percentage +
        '% </strong>' + 'of the total count of ' + analysisStratumName +
        ' as sex assigned at birth that ' + (domain === 'ehr' ? 'have EHR data' : 'answered this survey question') +
        ' (total count = <strong> ' + totalCount + '</strong>)' + '</div>';
    return toolTipHelpText;
  }

  prepFitbitCategoriesAndData() {
    const {genderAnalysis: {results}} = this.props;
    const pointData = [];
    const categoryArr = [];
    for (const concept of results) {
          const genderCountResults = results.filter(r =>
          r.stratum4 === concept.stratum2);
          let genderCountTooltip = '';
          let percentage;
          if (genderCountResults && genderCountResults.length > 0) {
                percentage = ((concept.countValue /
                genderCountResults[0].countValue) * 100).toFixed();
                if (percentage < 1) {
                    percentage =
                    ((concept.countValue / genderCountResults[0].countValue) * 100)
                    .toFixed(1);
                }
                const totCount = (genderCountResults[0].countValue <= 20) ? '&le; 20'
                : genderCountResults[0].countValue;
                genderCountTooltip += 'Total Count = <strong>' + totCount + '</strong>';
          }
          const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
          pointData.push({
            toolTipHelpText: '<div class="bio-sex-tooltip"><strong>' +
              count + '</strong>' +
              ' participants <br> who had <strong>' + concept.analysisStratumName +
              '</strong> as sex assigned at birth and that is <strong>' +
               percentage + '% </strong> of all participants with the same criteria. ('
               + genderCountTooltip + ')</div>',
            name: concept.analysisStratumName,
            y: concept.countValue,
            concept: '',
            analysisId: ''
          });
          categoryArr.push(concept.analysisStratumName);
        }
        pointData.sort((a, b) => a.name.localeCompare(b.name));
        categoryArr.sort();
        return { categories: categoryArr, data: pointData};
  }

  render() {
      const {options} = this.state;
      return <div>
        {options && <HighchartsReact highcharts={highCharts} options={options} />}
      </div>;
    }
}

@Component({
  selector: 'app-biosex-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./chart-biosex.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BioSexWrapperComponent extends BaseReactWrapper {
  @Input() genderAnalysis: any;
  @Input() genderCountAnalysis: any;
  @Input() selectedResult: any = null;
  @Input() domain: string;

  constructor() {
    super(BioSexChartReactComponent, ['genderAnalysis', 'genderCountAnalysis', 'selectedResult', 'domain']);
  }
}
