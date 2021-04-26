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
    conceptId: any;
    participantCount: any;
    valueAnalysis: any;
    domainCountAnalysis: any;
    genderId: any;
}

export class ValueReactChartComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.valueAnalysis !== this.props.valueAnalysis) {
        this.getChartOptions();
    }
  }

  getChartOptions() {
    const {conceptId} = this.props;
    if (conceptId === '903111' || conceptId === '903120') {
        this.getStackedChartOptions();
    } else {
        // Fetch rest of the value charts
        this.getValueChartOptions();
        console.log(this.state.options);
    }
  }

  getStackedChartOptions() {
      const {valueAnalysis: {analysisName, results}} = this.props;
      const {categories, series} = this.prepStackedCatsAndData(results);
      this.setStackedChartOptions(analysisName, categories, series);
      this.setState({options: baseOptions});
  }

  getValueChartOptions() {
     const {valueAnalysis: {analysisName, results}} = this.props;
     const {categories, series} = this.prepValueCatsAndData(results, analysisName);
     console.log(categories, series);
     this.setValueChartOptions(analysisName, categories, series);
     console.log(baseOptions);
     this.setState({options: baseOptions});
  }

  setStackedChartOptions(analysisName: string, categories: any, series: any) {
      baseOptions.chart.type = 'column';
      baseOptions.plotOptions.column.groupPadding = 0.40;
      baseOptions.plotOptions.series.pointWidth = 50;
      baseOptions.legend.enabled = false;
      baseOptions.title.style.color = '#262262';
      baseOptions.title.style.fontSize = '22px';
      baseOptions.color = '#2691D0';
      baseOptions.xAxis.title.text = this.props.conceptId;
      baseOptions.yAxis.title.text = 'Participant Count';
      baseOptions.yAxis.title.style.fontSize = '14px';
      baseOptions.xAxis.title.style.fontSize = '14px';
      baseOptions.yAxis.title.style.color = '#262262';
      baseOptions.yAxis.gridLineColor = '#F0F0F0';
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

  setValueChartOptions(analysisName: string, categories: any, series: any) {
    baseOptions.chart.type = 'bar';
    baseOptions.xAxis.categories = categories;
    baseOptions.series = series;
    console.log(baseOptions.chart);
    console.log(baseOptions.xAxis.categories);
    console.log(baseOptions.series);
    console.log(baseOptions);
  }

  prepStackedCatsAndData(valueAnalysisResults) {
    const {valueAnalysis: {analysisId}} = this.props;
    const data = [];
    const cats = [];
    const color = '#2691D0';
    // LOOP CREATES DYNAMIC CHART VARS
    const order = ['8507', '8532', '0'];
    valueAnalysisResults.sort((a, b) => {
      return order.indexOf(a.stratum3) - order.indexOf(b.stratum3);
    });
    for (const a of valueAnalysisResults) {
      let toolTipText = '';
      let participantCountText = '';
      if (a.countValue <= 20) {
        participantCountText = 'Participant Count: <strong> &le; 20 </strong>';
      } else {
        participantCountText = 'Participant Count: <strong>' + a.countValue + '</strong>';
      }

      toolTipText = '<div class="bio-sex-tooltip"> Sex Assigned At Birth: '
        + '<b>' + a.analysisStratumName + '</b>' +
        '<br/>' + participantCountText + '</div>';
      data.push({
        name: a.stratum4,
        y: a.countValue, color: color,
        toolTipHelpText: toolTipText,
        analysisId: analysisId
      });
      cats.push(a.analysisStratumName);
    }
    const dataOnlyLT20 = data.filter(x => x.y > 20).length === 0;
    const series = [
          {
          color: color,
          legendColor: color,
          colorByPoint: false,
          data: data,
          dataOnlyLT20: dataOnlyLT20
    }];
    return { categories: cats, series: series};
  }

  prepValueCatsAndData(valueAnalysisResults, analysisName) {
    const data = [];
    const cats = [];
    valueAnalysisResults.filter(r => r.stratum3 === this.props.genderId);
    for (const a of valueAnalysisResults) {
        let analysisStratumName = a.analysisStratumName;
        if (analysisStratumName === null) {
            analysisStratumName = GENDER_STRATUM_MAP[a.stratum3];
        }
        let tooltipText = '';
        let participantCountText = '';
        if (a.countValue <= 20) {
            participantCountText = 'Participant Count: <strong> &le; 20 </strong>';
        } else {
            participantCountText = 'Participant Count: <strong>' + a.countValue + '</strong>';
        }
        if (a.stratum2 !== 'No unit') {
            tooltipText = '<div class="chart-tooltip"> <b>' + analysisStratumName + '</b>' +
          '<br/>' + 'Measurement Value / Range:';
            if (a.stratum4.indexOf('>=') > -1) {
                tooltipText = tooltipText + ' &ge; <b>' + a.stratum4.replace('>=', '')
                    + '</b> <br/>' + participantCountText + '</div>';
            } else {
                tooltipText = tooltipText + ' <b>' + a.stratum4
                    + '</b> <br/>' + participantCountText + '</div>';
            }
        } else {
            tooltipText = '<div class="chart-tooltip"> <b>' + analysisStratumName + '</b>' +
                '<br/>' + 'Measurement Value : <b>' + a.stratum4
                + '</b> <br/>' + participantCountText + '</div>';
        }
        data.push({
                name: a.stratum4, y: a.countValue, thisCtrl: this,
                result: a, toolTipHelpText: tooltipText, binWidth: a.stratum6,
                analysisId: a.analysisId
        });
    }
    const lessThanData = data.filter(
          d => d.name != null && d.name.indexOf('< ') >= 0);
    const greaterThanData = data.filter(
          d => d.name != null && d.name.indexOf('>= ') >= 0);
    data.filter(d => d.name != null &&
          (d.name.indexOf('< ') === -1 || d.name.indexOf('>= ') === -1));
    data.sort((a, b) => {
          let aVal: any = a.name;
          let bVal: any = b.name;
          // Sort  numeric data as number
          if (a.name.indexOf(' - ') > 0) {
            aVal = a.name.split(' - ')[1];
          } else if (a.name.indexOf('< ') >= 0) {
            aVal = a.name.replace('< ', '');
          } else if (a.name.indexOf('>= ') >= 0) {
            aVal = a.name.replace('>= ', '');
          }
          if (b.name.indexOf(' - ') > 0) {
            bVal = b.name.split(' - ')[1];
          } else if (b.name.indexOf('< ') >= 0) {
            bVal = b.name.replace('< ', '');
          } else if (b.name.indexOf('>= ') >= 0) {
            bVal = b.name.replace('>= ', '');
          }
          if (isNaN(Number(aVal))) {
            // Don't do anything
          } else {
            // Make a number so sort works
            aVal = Number(aVal);
            bVal = Number(bVal);
          }
          if (aVal > bVal) {
            return -1;
          }
          if (aVal < bVal) {
            return 1;
          }
          return 0;
        });
    if (lessThanData.length > 0 && greaterThanData.length > 0) {
      data.unshift(greaterThanData[0]);
      data.push(lessThanData[0]);
    } else if (lessThanData.length > 0) {
      data.push(lessThanData[0]);
    } else if (greaterThanData.length > 0) {
      data.unshift(greaterThanData[0]);
    }
    if (data.length > 2) {
      if (greaterThanData.length === 0) {
        if (isNaN(Number(data[0].name))) {
          // Don't do anything
        } else {
          data[0].name = '>= ' + data[0].name;
        }
      }
      if (lessThanData.length === 0) {
        if (isNaN(Number(data[data.length - 1].name))) {
          // Don't do anything
        } else {
          data[data.length - 1].name = '< ' + data[data.length - 1].name;
        }
      }
    }
    for (const d of data) {
        cats.push(d.name);
    }
    // Unit for measurements is in stratum5
    // if (this.analysis.unitName === 'cm') {
    //    this.analysis.unitName = 'centimeter';
    // }
    // const unit = this.analysis.unitName ? this.analysis.unitName : '';
    const temp = data.filter(x => x.y > 20);
    const dataOnlyLT20 = temp.length > 0 ? false : true;
    const series: any = {
          name: analysisName,
          colorByPoint: true,
          data: data,
          dataOnlyLT20: dataOnlyLT20,
          colors: ['#bee1ff'],
    };
    series.pointPadding = 0;
    series.borderWidth = 0;
    series.groupPadding = 0;
    series.pointWidth = data.length >= 15 ? 15 : 18;
    series.shadow = false;
    return { categories: cats, series: series};
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
  selector: 'app-value-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./../../chart/chart.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ValueChartWrapperComponent extends BaseReactWrapper {
  @Input() conceptId: any;
  @Input() participantCount: number;
  @Input() valueAnalysis: any;
  @Input() domainCountAnalysis: any;
  @Input() genderId: any;

  constructor() {
    super(ValueReactChartComponent, ['conceptId', 'participantCount', 'valueAnalysis', 'domainCountAnalysis', 'genderId']);
  }
}
