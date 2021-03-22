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
    genderAnalysis: any;
    genderCountAnalysis: any;
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
    this.state = {options: null, genderAnalysis: props.genderAnalysis,
    genderCountAnalysis: props.genderCountAnalysis};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const newAnalysis = this.props.genderAnalysis;
    if (newAnalysis !== this.state.genderAnalysis) {
        this.setState({ genderAnalysis: newAnalysis }, this.getChartOptions);
    }
  }

  getChartOptions() {
    if (this.props.domain === 'fitbit') {
        this.getFitbitChartOptions();
    } else {
        this.getSurveyChartOptions();
    }
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
    const {genderAnalysis: {analysisName, results}} = this.state;
    const {selectedResult} = this.props;
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
    const filteredResults = results.filter(
              r => r.stratum4 === selectedResult.stratum4);
    const {categories, series} = this.prepSurveyCategoriesAndData(filteredResults);
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
    this.setState({options: baseOptions});
  }

  prepSurveyCategoriesAndData(genderAnalysisResults) {
    const {genderAnalysis: {analysisId}, genderCountAnalysis: {results}} = this.state;
    const data = [];
    const cats = [];
    const color = '#2691D0';
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of genderAnalysisResults) {
          // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
          const bsResult = results.filter(x => x.stratum2 === a.stratum5)[0];
          const count = (a.countValue <= 20) ? '&le; 20' : a.countValue;
          const totalCount = (bsResult.countValue <= 20) ? '&le; 20' : bsResult.countValue;
          if (a.analysisStratumName === null) {
           a.analysisStratumName = GENDER_STRATUM_MAP[a.stratum5];
          }
          const analysisStratumName = a.analysisStratumName;
          const percentage = Number(((a.countValue / bsResult.countValue) * 100).toFixed());
          const toolTipHelpText = '<div class="chart-tooltip">' +
                  '<strong> ' + count + '</strong> participants had ' + analysisStratumName +
                  ' as sex assigned at birth with this survey answer and that is ' + '<strong>' +
                  percentage + '% </strong>' + 'of the total count of ' +
                  analysisStratumName + ' as sex assigned at birth that answered this ' +
                  'survey question (total count ' +
                  '= <strong> ' + totalCount + '</strong>) </div>';
          data.push({
            name: a.analysisStratumName,
            y: a.countValue,
            color: color,
            sliced: true,
            toolTipHelpText: toolTipHelpText,
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

  prepFitbitCategoriesAndData() {
    const {genderAnalysis: {results}, genderCountAnalysis} = this.state;
    const pointData = [];
    const categoryArr = [];
    for (const concept of results) {
          const genderCountResults = genderCountAnalysis.results.filter(r =>
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
        {options && <HighchartsReact highcharts={highCharts} options={options}
        updateArgs={[true]}/>}
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
