import {
  Component,
  Input
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { getBaseOptions } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { reactStyles } from 'app/utils';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

const styles = reactStyles({
    standardChart: {
        display: 'block',
        backgroundSize: 'contain',
        height: '100%',
        width: '100%',
    }
});

interface State {
    options: any;
}

interface Props {
    concepts: any;
}

export class SourcesChartReactComponent extends React.Component<Props, State> {

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

  setChartOptions(categories: any, series: any) {
      const newBaseOptions = getBaseOptions();
      newBaseOptions.chart.type = 'column';
      newBaseOptions.chart.tooltip =  {
        headerFormat: '<span>{point.key} <br/>',
        pointFormat: '{point.y}</span>'
      };
      newBaseOptions.plotOptions.column.pointPadding = 0.25;
      newBaseOptions.plotOptions.series.minPointLength = 3;
      newBaseOptions.plotOptions.column.pointWidth = 20;
      newBaseOptions.xAxis.title.text = 'Source Concepts';
      newBaseOptions.yAxis.title.text = 'Participant Count';
      newBaseOptions.xAxis.categories = categories;
      newBaseOptions.tooltip.outside = true;
      newBaseOptions.series = [series];
      this.setState({options: newBaseOptions});
  }

  prepCategoriesAndData(concepts) {
    const data = [];
    const cats = [];
    const COLUMN_COLOR = '#2691D0';
    concepts.sort((a, b) => {
      return a.sourceCountValue < b.sourceCountValue;
    });
    for (const a of concepts) {
      const count = (a.sourceCountValue <= 20) ? '&le; 20' : a.sourceCountValue;
      const toolTipText = '<div class="chart-tooltip" style="position: relative; white-space:normal;">' + a.conceptName +
              ' (' + a.vocabularyId + '-' + a.conceptCode + ') ' +
              '<br/>' + 'Participant Count: ' + '<strong>' + count + '</strong> </div>';
      data.push({
        name: a.conceptName + ' (' + a.vocabularyId + '-' + a.conceptCode + ') ',
        y: a.sourceCountValue, analysisId: 'sources',
        color: COLUMN_COLOR,
        toolTipHelpText: toolTipText
      });
      cats.push(a.vocabularyId + '-' + a.conceptCode);
    }
    const dataOnlyLT20 = data.filter(x => x.y > 20).length === 0;
    console.log('here here here');
    console.log(concepts);
    // Override tooltip and colors and such
    const series = {
      name: concepts[0].domainId, colorByPoint: true, data: data, colors: ['#6CAEE3'],
      dataOnlyLT20: dataOnlyLT20
    };
    return { categories: cats, series: series};
  }

  render() {
      const {options} = this.state;
      return <div>
        {options && <HighchartsReact highcharts={highCharts} options={options} style={styles.standardChart}
        updateArgs={[true]}/>}
      </div>;
    }
}

@Component({
  selector: 'app-sources-chart-react',
  template: `<span #root></span>`
})
export class SourcesWrapperComponent extends BaseReactWrapper {
  @Input() concepts: any[];

  constructor() {
    super(SourcesChartReactComponent, ['concepts']);
  }
}
