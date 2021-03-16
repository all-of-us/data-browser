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
import { baseOptions } from '/w/public-ui/src/app/data-browser/charts/react-base-chart/base-chart.service';

const containerElementName = 'root';

interface State {
    options: any;
}

interface Props {
    genderAnalysis: any;
    genderCountAnalysis: any;
}

export class BioSexChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    console.log(props);
    this.state = {options: null};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  getChartOptions() {
    baseOptions.chart.type = 'bar';
    baseOptions.plotOptions.series.pointWidth = 50;
    baseOptions.yAxis.title.text = 'Participant Count';
    baseOptions.xAxis.title.text = '';
    baseOptions.yAxis.title.style.fontSize = '14px';
    baseOptions.xAxis.title.style.fontSize = '14px';
    baseOptions.yAxis.title.style.color = '#262262';
    baseOptions.yAxis.gridLineWidth = 1;
    baseOptions.yAxis.gridLineColor = '#F0F0F0';
    const {categories, data} = this.prepCategoriesAndData();
    baseOptions.xAxis.categories = categories;
    baseOptions.series[0].data = data;
    this.setState({options: baseOptions});
  }

  prepCategoriesAndData() {
    let pointData = [];
    let categoryArr = [];
    for (const concept of this.props.genderAnalysis.results) {
          const genderCountResults = this.props.genderCountAnalysis.results.filter(r =>
          r.stratum4 === concept.stratum2);
          let genderCountTooltip = '';
          let percentage;
          if (genderCountResults && genderCountResults.length > 0) {
                percentage = ((concept.countValue / genderCountResults[0].countValue) * 100).toFixed();
                if (percentage < 1) {
                    percentage =
                    ((concept.countValue / genderCountResults[0].countValue) * 100)
                    .toFixed(1);
                }
                const totCount = (genderCountResults[0].countValue <= 20) ? '&le; 20'
                : genderCountResults[0].countValue;
                genderCountTooltip += 'Total Count = <strong>' + totCount + '</strong>';
          }
          const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
          pointData.push({
            toolTipHelpText: '<div class="bio-sex-tooltip"><strong>' +
              count + '</strong>' +
              ' participants <br> who had <strong>' + concept.analysisStratumName +
              '</strong> as sex assigned at birth and that is <strong>' +
               percentage + '% </strong> of all participants with the same criteria. ('
               + genderCountTooltip + ')</div>',
            name: concept.analysisStratumName,
            y: concept.countValue,
            concept: '',
            analysisId: ''
          });
          categoryArr.push(concept.analysisStratumName);
        }
        pointData = pointData.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        }
        );
        categoryArr = categoryArr.sort((a, b) => {
          if (a > b) {
            return 1;
          }
          if (a < b) {
            return -1;
          }
          return 0;
        });
        return { categories: categoryArr, data: pointData};
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
  styleUrls: ['./chart-biosex.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BioSexWrapperComponent extends BaseReactWrapper {
  @Input() genderAnalysis: any;
  @Input() genderCountAnalysis: any;

  constructor() {
    super(BioSexChartReactComponent, ['genderAnalysis', 'genderCountAnalysis']);
  }
}
