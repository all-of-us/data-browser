import { Injectable } from '@angular/core';

@Injectable()
export class ChartService {
  barColor = '#2691D0';
  barWidth = 0;
  backgroundColor = 'trasnparent';
  mainTitle = {
    text: '',
    style: {
      color: '#666',
      fontSize: '12px',
    }
  };
  xAxisTitle = {
    text: '',
    style: {
      color: '#666',
      fontWeight: 'bold',
      whiteSpace: 'wrap',
      textOverflow: 'ellipsis'
    }
  };
  yAxisTitle = {
    text: '',
    style: {
      color: '#666',
      fontSize: '12px',
      whiteSpace: 'wrap',
      textOverflow: 'ellipsis'
    }
  };
  notEnabled = { enabled: false };

  constructor() { }

}
