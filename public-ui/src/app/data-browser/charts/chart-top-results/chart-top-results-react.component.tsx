import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

const cssStyle = `
.standard-chart {
    display: block;
    background-size: contain;
    height: 100%;
    width: 100%;
}
`;

interface State {
    options: any;
}

interface Props {
    concepts: any;
    onClick: Function;
}

export class TopResultsChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null};
  }

  componentDidMount() {
      this.getChartOptions();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.concepts !== this.props.concepts) {
        this.getChartOptions();
    }
  }

  getChartOptions() {
     const {concepts} = this.props;
     const {categories, series} = this.prepCategoriesAndData(concepts);
     this.setChartOptions(categories, series);
  }

  public barClick(e) {
    this.props.onClick(e.point.concept, true);
  }

  setChartOptions(categories: any, series: any) {
      const newBaseOptions = getBaseOptions();
      newBaseOptions.plotOptions.series.pointWidth = 20;
      newBaseOptions.yAxis.title.text = 'Participant Count';
      newBaseOptions.xAxis.title.text = 'Top Concepts';
      newBaseOptions.yAxis.labels.style.fontSize = '12px';
      newBaseOptions.xAxis.labels.style.fontSize = '12px';
      newBaseOptions.xAxis.labels.style.width = '200px';
      const longest = Math.max(...(categories.map(el => el.length)));
      if (longest > 200) {
        newBaseOptions.xAxis.labels.style.width = '300px';
      }
      newBaseOptions.xAxis.labels.formatter = function() {
        return '<div style="text-overflow: ellipsis; overflow: hidden;">' + this.value + '</div>';
      };
      newBaseOptions.chart.type = 'bar';
      newBaseOptions.yAxis.gridLineColor = '#ECF1F4';
      newBaseOptions.title.style.color = '#262262';
      newBaseOptions.title.style.fontSize = '12px';
      newBaseOptions.color = '#2691D0';
      newBaseOptions.xAxis.categories = categories;
      newBaseOptions.plotOptions.bar.events = {
        click: (event) => this.barClick(event)
      };
      newBaseOptions.series = series;
      this.setState({options: newBaseOptions});
  }

  public toolTip(concept: any) {
    let toolTipText;
    let count = '';
    if (concept.countValue <= 20) {
        count = '&le; 20';
    } else {
        count = concept.countValue.toString();
    }
    toolTipText = '<div class="chart-tooltip">' + concept.conceptName +
      ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ' +
      '<br/>' + 'Participant Count: ' + '<strong>' + count + '</strong>' + '</div>';
    return toolTipText;
  }

  prepCategoriesAndData(concepts) {
    const data = [];
    const cats = [];
    for (const concept of concepts) {
          data.push({
            toolTipHelpText: this.toolTip(concept),
            name: concept.conceptName + ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ',
            y: concept.countValue,
            concept: concept,
            analysisId: 'topConcepts'
          });
          cats.push(concept.conceptName);
    }
    const series = [{ data: data }];
    return { categories: cats, series: series};
  }

  render() {
      const {options} = this.state;
      return <div>
        <style>{cssStyle}</style>
        {options && <HighchartsReact highcharts={highCharts} options={options} className='standard-chart'
        updateArgs={[true]}/>}
      </div>;
    }
}

@Component({
  selector: 'app-top-results-chart-react',
  template: `<span #root></span>`,
  encapsulation: ViewEncapsulation.None,
})
export class TopResultsChartWrapperComponent extends BaseReactWrapper {
  @Input() concepts: any;
  @Input('onClick') onClick: Function;

  constructor() {
    super(TopResultsChartReactComponent, ['concepts', 'onClick']);
  }
}
