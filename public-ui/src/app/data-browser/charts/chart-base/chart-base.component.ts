import { Component, Injector, Input, } from '@angular/core';
import { Concept } from '../../../../publicGenerated/model/concept';
import { ChartService } from '../chart.service';

@Component({
  selector: 'app-chart-base',
  templateUrl: './chart-base.component.html',
  styleUrls: ['./chart-base.component.css']
})
export class ChartBaseComponent {
  protected chartService: ChartService;
  categoryArr: any[] = [];
  pointData: any[] = [];
  toolTipText: string;
  chartObj: Object;
  barPlotOptions: Object = {
    shadow: false,
    borderColor: null,
  };
  @Input() concepts: Concept[];


  constructor(injector: Injector) {
    this.chartService = injector.get(ChartService);

  }

  getChartOptions() {
    return {
      chart: this.chartObj,
      style: {
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontSize: '14px',
      },
      tooltip: {
        followPointer: true,
        formatter: function () {
          if (this.point.y <= 20) {
            if (this.point.analysisId === 3101 || this.point.analysisId === 3102) {
              this.point.toolTipHelpText =
                this.point.toolTipHelpText.replace('Medical Concept, Count:</b> 20',
                  'Medical Concept, Count:</b> &le; 20');
            } else if (this.point.analysisId === 'topConcepts' || this.point.analysisId === 'sources') {
              this.point.toolTipHelpText =
                this.point.toolTipHelpText.replace('Participant Count: <b>20',
                  'Participant Count: <b>&le; 20 </b>');
            }
          }
          if (this.point.toolTipHelpText.length >= 100) {
            return '<div style="height: auto; width: 500px; max-width: 500px; overflow: auto; white-space: normal;">' +
              this.point.toolTipHelpText + '</div>';
          } else {
            return this.point.toolTipHelpText;
          }
        },
        positioner: function(width, height, point) {
          var columnWidth = this.chart.series[0].options.pointWidth;
          return {
            x: point.plotX + this.chart.plotLeft,
            y: point.plotY - columnWidth / 2 + this.chart.plotTop - height
          };
        },
        useHTML: true,
        backgroundColor: '#FFFFFF',
        borderColor: '#262262',
        shadow: '0 4px 6px 0 rgba(0, 0, 0, 0.15)',
        enabled: true,
        style: {
          fontSize: '14px',
          fontFamily: 'GothamBook, Arial, sans-serif',
          color: '#302C71',
        }
      },
      colors: [this.chartService.barColor],
      title: this.chartService.mainTitle,
      xAxis: {
        categories: this.categoryArr,
        labels: {
          style: {
            fontSize: '12px',
            whiteSpace: 'wrap',
            textOverflow: 'ellipsis'
          },
        },
        title: this.chartService.xAxisTitle,
        tickLength: 0,
        lineWidth: 1,
        lineColor: '#979797',
      },
      yAxis: {
        title: this.chartService.yAxisTitle,
        tickLength: 0,
        lineWidth: 1,
        lineColor: '#979797',
        gridLineColor: 'transparent',
      },
      legend: this.chartService.notEnabled,
      credits: this.chartService.notEnabled,
      plotOptions: {
        series: {
          animation: {
            duration: 100,
          },
          pointWidth: 0
        },
        bar: this.barPlotOptions
      },
      series: [{ data: this.pointData }],
    };
  }
}
