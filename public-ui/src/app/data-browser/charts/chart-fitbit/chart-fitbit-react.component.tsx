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
    countAnalysis: any;
}

export class ChartFitbitReactComponent extends React.Component<Props, State> {

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
     const {categories, pointData} = this.prepCategoriesAndData(concepts);
     this.setChartOptions(categories, pointData);
  }

  setChartOptions(categories: any, series: any) {
      const newBaseOptions = getBaseOptions();
      newBaseOptions.chart.type = 'line';
      newBaseOptions.plotOptions.series.pointWidth = 20;
      newBaseOptions.yAxis.title.text = 'Participant Count';
      newBaseOptions.xAxis.title.text = '';
      newBaseOptions.xAxis.categories = categories;
      newBaseOptions.yAxis.title.style.fontSize = '14px';
      newBaseOptions.xAxis.title.style.fontSize = '14px';
      newBaseOptions.yAxis.gridLineWidth = 1;
      newBaseOptions.yAxis.gridLineColor = '#F0F0F0';
      newBaseOptions.xAxis.gridLineWidth = 1;
      newBaseOptions.xAxis.gridLineColor = '#F0F0F0';
      newBaseOptions.xAxis.labels = {
            style: {
                   fontSize: '12px',
                   whiteSpace: 'wrap',
                   textOverflow: 'ellipsis',
                   color: '#262262'
            },
            formatter: function() {
                   const label = this.axis.defaultLabelFormatter.call(this);
                   return label;
                   },
                   useHTML: true
      };
      newBaseOptions.tooltip.positioner = undefined;
      newBaseOptions.tooltip.outside = true;
      newBaseOptions.series = [{ data: series }];
      this.setState({options: newBaseOptions});
  }

  prepCategoriesAndData(concepts) {
    const pointData = [];
    const categoryArr = [];
    for (const concept of concepts.results) {
      const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
      const totalCount = (this.props.countAnalysis && this.props.countAnalysis.results) ?
      this.props.countAnalysis.results[0].countValue : 0;
      const percentage = ((concept.countValue / totalCount) * 100).toFixed();
      pointData.push({
        toolTipHelpText: '<div class="fitbit-tooltip" style="white-space: normal; word-wrap: break-word; font-size: 14px; width: 20em;"><strong>' + count +
          ' </strong> participants had <br>'
          + concept.stratum1 + '<br> by <strong>' + concept.stratum2 + '</strong>' +
          ' and that is <strong>' + percentage + '</strong>% of Total Fitbit Participants. (Total Count = )' +
          '<strong> ' + totalCount + '</strong>'
          + '</div>',
        name: '',
        y: concept.countValue,
        concept: '',
        analysisId: ''
      });
      categoryArr.push(concept.stratum2);
    }
    return { categories: categoryArr, pointData: pointData};
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
