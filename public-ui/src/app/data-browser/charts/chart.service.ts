import { Injectable } from '@angular/core';

@Injectable()
export class ChartService {
  barColor = '#2691D0';
  barWidth = 35;
  backgroundColor = 'trasnparent';
  noTitle = {
    text: 'y axis title',
    style: {
      color: '#666',
      fontWeight: 'bold',
    }
  };
  notEnabled = { enabled: false };

  constructor() { }

}
