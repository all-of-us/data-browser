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

export const VERSION_STRATUM_MAP = {
    'January': '1',
    'February': '2',
    'March': '3',
    'April': '4',
    'May': '5',
    'June': '6',
    'July/August': '7',
    'September': '9',
    'October': '10',
    'November': '11',
    'December': '12'
};

export const AGE_STRATUM_MAP = {
    '2': '18-29',
    '3': '30-39',
    '4': '40-49',
    '5': '50-59',
    '6': '60-69',
    '7': '70-79',
    '8': '80-89',
    '9': '89+'
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
  title: {
      text: '',
      style: {
        color: '#666',
        fontSize: '12px',
        fontFamily: 'GothamBook',
        fontWeight: 'normal'
      }
  },
  tooltip: {
        followPointer: true,
        outside: false,
        formatter: function(tooltip) {
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
            return '<div class="tooltip-container" style="position: relative; z-index: 200;">'
            + this.point.toolTipHelpText + '</div>';
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
          formatter: function() {
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
    gridLineWidth: 1,
    gridLineColor: 'transparent'
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
            formatter: function() {
                const label = this.axis.defaultLabelFormatter.call(this);
                return label;
            },
            useHTML: true
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

export function getBaseOptions() {
  return Object.assign({}, baseOptions);
}
