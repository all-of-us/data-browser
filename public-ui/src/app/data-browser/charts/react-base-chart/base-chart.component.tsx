import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export const baseOptions = {
  chart: {
    type: 'spline'
  },
  title: {
    text: 'My chart'
  },
  series: [
    {
      data: [1, 2, 1, 4, 3, 6]
    }
  ]
};