import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { environment } from 'environments/environment';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { baseOptions } from '/w/public-ui/src/app/data-browser/charts/react-base-chart/base-chart.component';

const containerElementName = 'root';

interface State {
    options: any;
}

interface Props {
    data: any;
}

export class BioSexChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  getChartOptions() {
    this.setState({options: baseOptions});
  }

  render() {
      const {options} = this.state;
      return <div>
        {options && <HighchartsReact highcharts={highCharts} options={options} />}
      </div>;
    }
}

@Component({
  selector: 'app-biosex-chart-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class BioSexWrapperComponent extends BaseReactWrapper {

  constructor() {
    super(BioSexChartReactComponent, []);
  }
}
