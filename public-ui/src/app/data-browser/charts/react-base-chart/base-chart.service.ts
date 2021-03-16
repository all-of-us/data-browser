import * as highCharts from 'highcharts';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import HighchartsReact from 'highcharts-react-official';

export const baseOptions = {
  style: {
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontSize: '14px',
  },
  chart: {
        type: '',
        backgroundColor: 'transparent'
  },
  tooltip: {
      followPointer: true,
      formatter: function () {
        if (this.point.y <= 20) {
          if (this.point.analysisId === 3101 || this.point.analysisId === 3102) {
            this.point.toolTipHelpText =
              this.point.toolTipHelpText.replace('Medical Concept, Count:</b> 20',
                'Medical Concept, Count:</b> &le; 20');
          } else if (this.point.analysisId === 'topConcepts' ||
            this.point.analysisId === 'sources') {
            this.point.toolTipHelpText =
              this.point.toolTipHelpText.replace('Participant Count: <b>20',
                'Participant Count: <b>&le; 20 </b>');
          }
        }
        return '<div class="tooltip-container" style="position: absolute; z-index: 520;">'
          + this.point.toolTipHelpText + '</div>';
      },
      positioner: function(width, height, point) {
        const columnWidth = this.chart.series[0].options.pointWidth;
        return {
          x: point.plotX + this.chart.plotLeft,
          y: point.plotY - columnWidth / 2 + this.chart.plotTop - height
        };
      },
      useHTML: true,
      enabled: true,
      borderColor: '#262262',
      borderRadius: '1px',
      backgroundColor: '#FFFFFF',
      style: {
        color: '#302C71',
      }
    },
    colors: ['#2691D0'],
    title: {
               text: '',
               style: {
                 color: '#666',
                 fontSize: '12px',
               }
    },
    xAxis: {
        categories: [],
        labels: {
        style: {
            fontSize: '12px',
            whiteSpace: 'wrap',
            textOverflow: 'ellipsis',
            color: '#262262'
        },
    },
    title: {
               text: '',
               style: {
                 color: '#262262',
                 fontWeight: 'bold',
                 whiteSpace: 'wrap',
                 textOverflow: 'ellipsis',
                 fontSize: ''
               }
             },
    tickLength: 0,
    lineWidth: 1,
    lineColor: '#979797',
  },
  yAxis: {
          title: {
                     text: '',
                     style: {
                       color: '#262262',
                       fontSize: '12px',
                       whiteSpace: 'wrap',
                       textOverflow: 'ellipsis'
                     }
                   },
          tickLength: 0,
          lineWidth: 1,
          lineColor: '#979797',
          gridLineColor: 'transparent',
          gridLineWidth: 0,
          labels: {
            style: {
              fontSize: '12px',
              whiteSpace: 'wrap',
              textOverflow: 'ellipsis',
              color: '#262262'
            },
          }
  },
  legend: { enabled: false },
  credits: { enabled: false },
  plotOptions: {
          series: {
            animation: {
              duration: 100,
            },
            pointWidth: 0
          },
          bar: {
                   shadow: false,
                   borderColor: null,
                 }
        },
  series: [{ data: [] }]
};
