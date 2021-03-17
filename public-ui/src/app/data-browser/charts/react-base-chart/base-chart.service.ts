import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export const GENDER_STRATUM_MAP = {
     '8507': 'Male',
     '8532': 'Female',
     '8521': 'Other',
     '0': 'Other',
     '8551': 'Unknown',
     '8570': 'Ambiguous',
     '1585849': 'None of these describe me',
     '1585848': 'Intersex',
};


export const baseOptions = {
  lang: { thousandsSep: ',' },
  style: {
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontSize: '14px',
  },
  chart: {
        type: '',
        backgroundColor: 'transparent'
  },
  color: '',
  tooltip: {
      followPointer: true,
      outside: true,
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
          reserveSpace: true,
          style: {
            whiteSpace: 'wrap',
            textOverflow: 'ellipsis',
            width: '80px',
            fontSize: '14px'
          },
          formatter: function () {
            const label = this.axis.defaultLabelFormatter.call(this);
            // Change <= 20 count to display '<= 20'
            if (label && label.indexOf('>=') > -1) {
              return '&#8805; ' + label.replace('>=', '');
            }
            return label;
          },
          useHTML: true,
        },
    title: {
               text: '',
               style: {
                 color: '#262262',
                 whiteSpace: 'wrap',
                 textOverflow: 'ellipsis',
                 fontWeight: 'bold',
                 textTransform: 'capitalize',
                 fontSize: '14px'
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
                       fontSize: '14px',
                       fontWeight: 'bold',
                       textTransform: 'capitalize',
                       whiteSpace: 'wrap',
                       textOverflow: 'ellipsis',
                     }
                   },
          min: 20,
          gridLineWidth: 1,
          tickLength: 0,
          lineWidth: 1,
          lineColor: '#979797',
          gridLineColor: 'transparent',
          labels: {
            style: {
              fontSize: '12px',
              whiteSpace: 'wrap',
              textOverflow: 'ellipsis',
              color: '#262262'
            },
          }
  },
  zAxis: {},
  legend: { enabled: false },
  credits: { enabled: false },
  plotOptions: {
          series: {
            animation: {
              duration: 100,
            },
            pointWidth: 0,
            minPointLength: 3,
            events: {
            },
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
          },
        column: {
                  shadow: false,
                  borderColor: null,
                  colorByPoint: true,
                  groupPadding: 0,
                  pointPadding: 0,
                  borderWidth: 0,
                  dataLabels: {
                    enabled: false,
                  },
                  events: {},
            }
        },
  series: [{ data: [] }]
};
