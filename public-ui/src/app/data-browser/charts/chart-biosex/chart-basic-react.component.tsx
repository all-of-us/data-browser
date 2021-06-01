import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { GENDER_STRATUM_MAP, getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

interface State {
}

interface Props {
}

export class BasicChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
      this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    console.log(prevProps, '... prev ...');
    console.log(this.props, '... current ...');
    console.log('am i here');
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
