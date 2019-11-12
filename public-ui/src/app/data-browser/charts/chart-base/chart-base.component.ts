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
      tooltip: {
        followPointer: true,
        formatter: function () {
          if (this.point.y <= 20 && this.point.toolTipHelpText.indexOf('% of') === -1) {
            if (this.point.toolTipHelpText.length >= 100) {
              return '<div style="width: 500px; white-space: normal;">' +
                this.point.toolTipHelpText + '<b> &le; ' + this.point.y + '</b>' +
                '</div>';
            } else {
              return this.point.toolTipHelpText + '<b> &le; ' + this.point.y + '</b>';
            }
          } else if (this.point.toolTipHelpText.indexOf('% of') >= 0) {
            if (this.point.actualCount <= 20) {
              if (this.point.toolTipHelpText.length >= 100) {
                return '<div style="width: 500px; white-space: normal;">' +
                  this.point.toolTipHelpText + '<b> &le; ' + this.point.actualCount + '</b>' +
                  '</div>';
              } else {
                return this.point.toolTipHelpText + '<b> &le; ' + this.point.actualCount + '</b>';
              }
            } else {
              if (this.point.toolTipHelpText.length >= 100) {
                return '<div style="width: 500px; white-space: normal;">' +
                  this.point.toolTipHelpText + '<b>' + this.point.actualCount + '</b>' +
                  '</div>';
              } else {
                return this.point.toolTipHelpText + '<b>' + this.point.actualCount + '</b>';
              }
            }
          } else {
            if (this.point.toolTipHelpText.length >= 100) {
              return '<div style="width: 500px; white-space: normal;">' +
                this.point.toolTipHelpText + '</div>';
            } else {
              return this.point.toolTipHelpText;
            }
          }
        },
        useHTML: true,
        style: {
          padding: 0,
        },
        backgroundColor: '#f0f2f3',
        borderWidth: 0,
        shadow: false,
        enabled: true,
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
