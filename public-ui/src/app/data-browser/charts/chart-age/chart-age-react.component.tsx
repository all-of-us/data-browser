import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AGE_STRATUM_MAP, baseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

interface State {
    options: any;
}

interface Props {
    ageAnalysis: any;
    ageCountAnalysis: any;
    selectedResult: any;
    domain: string;
}

export class AgeChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null};
    console.log(this.props, '...');
  }

  componentDidMount() {
    this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.ageAnalysis !== this.props.ageAnalysis) {
        this.getChartOptions();
    }
  }

  getChartOptions() {
    const {domain} = this.props;
    if (domain === 'fitbit') {
        this.getFitbitChartOptions();
    } else if (domain === 'ehr') {
        this.getEhrChartOptions();
    } else if (domain === 'survey') {
        this.getSurveyChartOptions();
    } else {
        this.getPMChartOptions();
    }
  }

  getFitbitChartOptions() {
      baseOptions.chart.type = 'column';
      baseOptions.plotOptions.series.pointWidth = 50;
      baseOptions.yAxis.title.text = 'Participant Count';
      baseOptions.xAxis.title.text = '';
      baseOptions.yAxis.gridLineColor = '#F0F0F0';
      baseOptions.xAxis.gridLineColor = '#F0F0F0';
      const {categories, data} = this.prepFitbitCategoriesAndData();
      baseOptions.xAxis.categories = categories;
      baseOptions.series[0].data = data;
      this.setState({options: baseOptions});
  }

  getEhrChartOptions() {
      const {ageAnalysis: {results}} = this.props;
      const {categories, series} = this.prepEhrOrSurveyCategoriesAndData(results);
      this.setCommonAgeChartOptions('Age at First Occurrence in Participant Record',
      categories, series);
      this.setState({options: baseOptions});
  }

  getPMChartOptions() {
      const {ageAnalysis: {results}} = this.props;
      const {categories, series} = this.prepEhrOrSurveyCategoriesAndData(results);
      this.setCommonAgeChartOptions('Age When Physical Measurement Was Taken', categories, series);
      this.setState({options: baseOptions});
  }

  getSurveyChartOptions() {
      const {ageAnalysis: {results}, selectedResult} = this.props;
      const filteredResults = results.filter(
                r => r.stratum4 === selectedResult.stratum4);
      const {categories, series} = this.prepEhrOrSurveyCategoriesAndData(filteredResults);
      this.setCommonAgeChartOptions('Age When Survey Was Taken', categories, series);
      this.setState({options: baseOptions});
  }

  setCommonAgeChartOptions(analysisName: string, categories: any, series: any) {
     baseOptions.chart.type = 'column';
     baseOptions.plotOptions.column.groupPadding = 0.40;
     baseOptions.plotOptions.series.pointWidth = 45;
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
            formatter: function() {
              const label = this.axis.defaultLabelFormatter.call(this);
              if (series[0].dataOnlyLT20) {
                if (label <= 20) {
                    return '&#8804; 20';
                }
              }
              return label;
                   },
                   useHTML: true
            };
      }
      baseOptions.series = series;
  }

  prepEhrOrSurveyCategoriesAndData(ageAnalysisResults) {
    const {ageAnalysis: {analysisId}, ageCountAnalysis: {results}, domain} = this.props;
    const data = [];
    const cats = [];
    const color = '#2691D0';
    let seriesName = '';
    if (domain === 'ehr') {
        seriesName = 'Age at First Occurrence in Participant Record';
    } else if (domain === 'survey') {
        seriesName = 'Age When Survey Was Taken';
    } else {
        seriesName = 'Age When Physical Measurement Was Taken';
    }
    // LOOP CREATES DYNAMIC CHART VARS
    for (const a of ageAnalysisResults) {
          // For normal Gender Analysis , the stratum2 is the gender . For ppi it is stratum5;
          const ageResult = results.filter(x => (domain === 'survey' ? x.stratum2 : x.stratum4) ===
          (domain === 'survey' ? a.stratum5 : a.stratum2))[0];
          const count = (a.countValue <= 20) ? '&le; 20' : a.countValue.toLocaleString();
          const totalCount = (ageResult.countValue <= 20) ? '&le; 20'
          : ageResult.countValue.toLocaleString();
          if (a.analysisStratumName === null) {
           a.analysisStratumName = AGE_STRATUM_MAP[(domain === 'ehr' ? a.stratum2 : a.stratum5)];
          }
          const analysisStratumName = a.analysisStratumName;
          const percentage = Number(((a.countValue / ageResult.countValue) * 100).toFixed());
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
          name: seriesName + ', Selected Answered Count',
          colorByPoint: false,
          data: data,
          dataOnlyLT20: dataOnlyLT20
          }];
        return { categories: cats, series: series};
  }

  getTooltipHelpText(count, analysisStratumName, percentage, totalCount, domain) {
      return '<div class="chart-tooltip">' +
                      '<strong>' + count + '</strong>' + ' participants were ages within range ' +
                      analysisStratumName + ' when' + (domain === 'pm' ? ' physical measurement with' : '') +
                      ' this medical concept first occurred and that is <strong>' +
                      percentage + '</strong>' + '% of all participants with the same criteria. (Total Count = <strong> '
                      + totalCount + '</strong>) </div>';
  }

  prepFitbitCategoriesAndData() {
    const {ageAnalysis: {results}, ageCountAnalysis} = this.props;
    const pointData = [];
    const categoryArr = [];
    for (const concept of results) {
          const ageCountResults = ageCountAnalysis.results.filter(r =>
          r.stratum4 === concept.stratum2);
          let ageCountTooltip = '';
          let percentage;
          if (ageCountResults && ageCountResults.length > 0) {
                percentage = ((concept.countValue /
                ageCountResults[0].countValue) * 100).toFixed();
                if (percentage < 1) {
                    percentage =
                    ((concept.countValue / ageCountResults[0].countValue) * 100)
                    .toFixed(1);
                }
                const totCount = (ageCountResults[0].countValue <= 20) ? '&le; 20'
                : ageCountResults[0].countValue;
                ageCountTooltip += 'Total Count = <strong>' + totCount + '</strong>';
          }
          const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
          pointData.push({
            toolTipHelpText: '<div class="age-tooltip"><strong>' + count
                + '</strong> participants were ages within range of <strong>' +
                concept.analysisStratumName + '</strong> and that is <strong>' +
                percentage + '% </strong> of all participants with the same criteria. (' +
                ageCountTooltip + ')</div>',
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
  selector: 'app-age-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./chart-age.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AgeWrapperComponent extends BaseReactWrapper {
  @Input() ageAnalysis: any;
  @Input() ageCountAnalysis: any;
  @Input() selectedResult: any = null;
  @Input() domain: string;

  constructor() {
    super(AgeChartReactComponent, ['ageAnalysis', 'ageCountAnalysis', 'selectedResult', 'domain']);
  }
}
