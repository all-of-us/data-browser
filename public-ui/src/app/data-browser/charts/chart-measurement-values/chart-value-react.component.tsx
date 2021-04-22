import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { baseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
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
    }
  }

  getStackedChartOptions() {
      const {valueAnalysis: {analysisName, results}} = this.props;
      const {categories, series} = this.prepStackedCatsAndData(results);
      this.setStackedChartOptions(analysisName, categories, series);
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

  constructor() {
    super(ValueReactChartComponent, ['conceptId', 'participantCount', 'valueAnalysis', 'domainCountAnalysis']);
  }
}
