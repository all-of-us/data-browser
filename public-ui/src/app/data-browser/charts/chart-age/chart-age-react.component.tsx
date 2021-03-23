import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { baseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

interface State {
    options: any;
}

interface Props {
    ageAnalysis: any;
    ageCountAnalysis: any;
    selectedResult: any;
    domain: string;
}

export class AgeChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null};
  }

  componentDidMount() {
    this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.ageAnalysis !== this.props.ageAnalysis) {
        this.getChartOptions();
    }
  }

  getChartOptions() {
    if (this.props.domain === 'fitbit') {
        this.getFitbitChartOptions();
    }
  }

  getFitbitChartOptions() {
      baseOptions.chart.type = 'column';
      baseOptions.plotOptions.series.pointWidth = 50;
      baseOptions.yAxis.title.text = 'Participant Count';
      baseOptions.xAxis.title.text = '';
      baseOptions.yAxis.gridLineColor = '#F0F0F0';
      baseOptions.xAxis.gridLineColor = '#F0F0F0';
      const {categories, data} = this.prepFitbitCategoriesAndData();
      baseOptions.xAxis.categories = categories;
      baseOptions.series[0].data = data;
      this.setState({options: baseOptions});
  }

  prepFitbitCategoriesAndData() {
    const {ageAnalysis: {results}, ageCountAnalysis} = this.props;
    const pointData = [];
    const categoryArr = [];
    for (const concept of results) {
          const ageCountResults = ageCountAnalysis.results.filter(r =>
          r.stratum4 === concept.stratum2);
          let ageCountTooltip = '';
          let percentage;
          if (ageCountResults && ageCountResults.length > 0) {
                percentage = ((concept.countValue /
                ageCountResults[0].countValue) * 100).toFixed();
                if (percentage < 1) {
                    percentage =
                    ((concept.countValue / ageCountResults[0].countValue) * 100)
                    .toFixed(1);
                }
                const totCount = (ageCountResults[0].countValue <= 20) ? '&le; 20'
                : ageCountResults[0].countValue;
                ageCountTooltip += 'Total Count = <strong>' + totCount + '</strong>';
          }
          const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
          pointData.push({
            toolTipHelpText: '<div class="age-tooltip"><strong>' + count
                + '</strong> participants were ages within range of <strong>' +
                concept.analysisStratumName + '</strong> and that is <strong>' +
                percentage + '% </strong> of all participants with the same criteria. (' +
                ageCountTooltip + ')</div>',
            name: concept.analysisStratumName,
            y: concept.countValue,
            concept: '',
            analysisId: ''
          });
          categoryArr.push(concept.analysisStratumName);
        }
        pointData.sort((a, b) => a.name.localeCompare(b.name));
        categoryArr.sort();
        return { categories: categoryArr, data: pointData};
  }

  render() {
    const {options} = this.state;
    return <div>
          {options && <HighchartsReact highcharts={highCharts} options={options}
          updateArgs={[true]}/>}
    </div>;
  }
}

@Component({
  selector: 'app-age-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./chart-age.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AgeWrapperComponent extends BaseReactWrapper {
  @Input() ageAnalysis: any;
  @Input() ageCountAnalysis: any;
  @Input() selectedResult: any = null;
  @Input() domain: string;

  constructor() {
    super(AgeChartReactComponent, ['ageAnalysis', 'ageCountAnalysis', 'selectedResult', 'domain']);
  }
}
