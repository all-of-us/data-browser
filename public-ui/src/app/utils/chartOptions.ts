import {Injectable} from '@angular/core';
import { DbConfigService } from './db-config.service';

@Injectable()
export class ChartOptions {
  constructor(private dbc: DbConfigService) {
  }

  public makeOptions(options_chart, title, subtitle, pointwidth, dataLabelStyle, distance,
                     gridLineColor, xAxisTitle, categories, options_series) {
    return {
      chart: options_chart,
      lang: {
        noData: {
          style: {
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#303030'
          }
        }
      },
      credits: {
        enabled: false
      },
      title: '',
      subtitle: {},
      tooltip: {
        followPointer: true,
        backgroundColor: '#f0f2f3',
        borderWidth: 0,
        borderRadius: 10,
        shadow: false,
        style: {
          padding: 0,
          borderRadius: 3,
          fontSize: '12px',
          color: '#262262'
        },
      },
      plotOptions: {
        series: {
          animation: {
            duration: 100,
          },
          pointWidth: pointwidth,
          minPointLength: 3,
          events: {},
        },
        pie: {
          borderColor: null,
          slicedOffset: 4,
          size:  '100%',
          dataLabels: {
            enabled: true,
            style: dataLabelStyle,
            distance: distance,
            formatter: function () {
              if (this.percentage < 1) {
                return this.point.name + ' ' + Number(this.percentage).toFixed(1) + '%';
              }
              return this.point.name + ' ' + Number(this.percentage).toFixed(0) + '%';
            }
          }
        },
        column: {
          shadow: false,
          borderColor: null,
          colorByPoint: true,
          groupPadding: 0,
          pointPadding: 0,
          dataLabels: {
            enabled: false,
          },
          events: {},
        },
        bar: {
          shadow: false,
          borderColor: null,
          colorByPoint: true,
          groupPadding: 0,
          pointPadding: 0,
          dataLabels: {
            enabled: false,
          },
          events: {}
        }
      },
      yAxis: {
        title: {
          text: null
        },
        min: 20,
        labels: {
          style: {
            fontSize: '12px',
          },
          formatter: function () {
            const label = this.axis.defaultLabelFormatter.call(this);
            // Change <= 20 count to display '<= 20'
            if (label <= 20) {
              return '&#8804; 20';
            }
            return label;
          },
          useHTML: true,
        },
        lineWidth: 1,
        lineColor: this.dbc.AXIS_LINE_COLOR,
        gridLineColor: gridLineColor,
      },
      xAxis: {
        title: {
          text: xAxisTitle,
        },
        categories: categories,
        // type: 'category',
        labels: {
          align: 'right',
          reserveSpace: true,
          style: {
            whiteSpace: 'wrap',
            fontSize: '12px',
            color: '#222222',
          },
        },
        lineWidth: 1,
        lineColor: this.dbc.AXIS_LINE_COLOR,
        tickLength: 0
      },
      zAxis: {},
      legend: {
        enabled: false
      },
      series: options_series,
    };
  }
}
