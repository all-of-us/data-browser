import {
  Component,
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

export class BasicChartReactComponent extends React.Component<{}, {}> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
      this.getChartOptions();
  }

  getChartOptions() {
  }


  render() {
      const options = {
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
      console.log('in basic chart');
      return <div>
        {options && <HighchartsReact highcharts={highCharts} options={options}
        updateArgs={[true]}/>}
      </div>;
    }
}

@Component({
  selector: 'app-basic-chart-react',
  template: `<span #root></span>`
})
export class BasicChartWrapperComponent extends BaseReactWrapper {
  constructor() {
    super(BasicChartReactComponent, []);
  }
}
