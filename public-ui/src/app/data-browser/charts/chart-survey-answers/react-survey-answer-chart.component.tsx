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
:host {
    display: block;
    padding:1rem 3rem;
}
.answer-chart-layout {
    display:flex;
    justify-content: center;
    align-items: flex-end;
}
.legend {
    padding:1rem;
    padding-bottom: 2rem;
    max-width: 15rem;
}

.legend-inner {
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    overflow-y: auto;
    max-height: 20rem;
}
.legend-item {
    display: grid;
    grid-template-columns: 1rem 1fr;
    font-size:.8em;
    padding-bottom: .5em;
}

.legend-item span {
    text-align: left;
}

.standard-chart {
    display: block;
    background-size: contain;
    height: auto;
    width: 75%;
    padding: 1rem 3rem;
}
`;

const eightColors = [
    '#2F4B7C', '#F99059', '#496D91', '#E75955',
    '#6790A2', '#93003A', '#BFE1C6', '#C5254A'
];

const tenColors = [
    '#2F4B7C', '#FA9B58', '#44668D', '#BC1B48', '#769EA7',
    '#F06F57', '#5B829C', '#93003A', '#BFE1C6', '#DB4451'
];

const fourteenColors = [
    '#2F4B7C', '#FBA858', '#88AFAB', '#CB2D4C', '#3E5E88', '#F78858', '#719AA6', '#B11044', '#4D7294',
    '#EE6857', '#5E869E', '#93003A', '#93003A', '#DF4A53'
];

const eightteenColors = [
    '#2F4B7C', '#FA9659', '#BFE1C6', '#D2364F', '#AB0A42', '#6F98A0', '#3A5A86', '#93B8AC', '#FBAF57',
    '#527997', '#F57D58', '#46698F', '#EC6556', '#C02049', '#60889F', '#80A8AA', '#E14D53', '#93003A',
];

const twentyFiveColors = [
    '#00429D', '#93C4D2', '#6492C0', '#B61A49', '#E37B7E', '#FBAF57', '#73A2C6', '#FA9659', '#4771B2',
    '#DF6772', '#A5D5D8', '#3761AB', '#D0CCB6', '#D95367', '#DAB8A7', '#D3F4E0', '#E38F8B', '#2451A4',
    '#5681B9', '#A60841', '#BFE1C6', '#C42D52', '#82B3CD', '#F57D58', '#93003A'
];

const monthOrder = ['May', 'June', 'July/August'];

interface State {
    answerChartInfo: any;
    chartSeries: any;
    categoryArr: any;
    options: any;
    colors: any;
}

interface Props {
    versionAnalysis: any;
    countAnalysis: any;
}

export class SurveyAnswerChartReactComponent extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {options: null, answerChartInfo: [], chartSeries: [], categoryArr: [], colors: []};
  }

  componentDidMount() {
      this.prepChartData();
  }

  prepChartData() {
    const { countAnalysis } = this.props;
    const answerCount = countAnalysis.length;
    const answerChartInfo = [];
    const colors = [];
    countAnalysis.forEach((aCount, i) => {
        if (answerCount <= 8) {
            aCount['color'] = eightColors[i];
        } else if (answerCount > 8 && answerCount <= 10) {
            aCount['color'] = tenColors[i];
        } else if (answerCount <= 14) {
            aCount['color'] = fourteenColors[i];
        } else if (answerCount <= 18) {
            aCount['color'] = eightteenColors[i];
        } else if (answerCount > 18) {
            aCount['color'] = twentyFiveColors[i];
        }
        answerChartInfo.push({
            color: aCount.color,
            totalCount: aCount.countValue,
            answerId: aCount.stratum3,
            answerValue: aCount.stratum4
        });
        colors.push(aCount.color);
    });
    this.setState({answerChartInfo: answerChartInfo, colors: colors}, () => {
        this.sortAnswers();
    });
  }

  public sortAnswers() {
    const { versionAnalysis } = this.props;
    const result = versionAnalysis.reduce((r, a) => {
      r[a.stratum7] = [...r[a.stratum7] || [], a];
      return r;
    }, {});
    const payload = {};
    Object.keys(result).sort((a, b) => {
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    }).forEach(key => {
        payload[key] = result[key];
    });
    return this.conceptDist(payload);
  }

  public mapOrder(array: any[], order: any[], key: string) {
    array.sort((a, b) =>
     order.indexOf(a[key]) - order.indexOf(b[key])
    );
  }

  public conceptDist(sortedAnswers: any) {
    let tempArr: any[] = [];
    const categoryArr = [];
    const { answerChartInfo } = this.state;
    for (const prop in sortedAnswers) {
      if (sortedAnswers.hasOwnProperty(prop)) {
        categoryArr.push(prop);
        const answerOrder = answerChartInfo.map(p => p.answerId);
        this.mapOrder(sortedAnswers[prop], answerOrder, 'stratum3');
        sortedAnswers[prop].forEach(answer => {
          tempArr.push({
            name: answer.stratum4,
            data: []
          });
        });
      }
    }

    // remove duplicates
    tempArr =
      Array.from(new Set(tempArr.map(x => JSON.stringify(x)))).map(x => JSON.parse(x));

    for (const prop in sortedAnswers) {
      if (sortedAnswers.hasOwnProperty(prop)) {
        tempArr.forEach(stack => {
          sortedAnswers[prop].forEach(answer => {
            if (stack.name === answer.stratum4) {
              stack.data.push(answer.countValue);
            }
          });
        });
      }
    }
    this.setState({chartSeries: tempArr, categoryArr: categoryArr}, () => {
        this.buildChartData();
    });
  }

  buildChartData() {
    const { categoryArr, chartSeries, colors } = this.state;
    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = 'column';
    newBaseOptions.xAxis.categories = categoryArr;
    newBaseOptions.series = chartSeries;
    newBaseOptions.yAxis.title.text = 'Participant Count';
    newBaseOptions.yAxis.title.style.fontSize = '16px';
    newBaseOptions.xAxis.labels.style.fontSize = '14px';
    newBaseOptions.yAxis.labels.style.fontSize = '16px';
    newBaseOptions.yAxis.title.style.padding = '1rem';
    newBaseOptions.plotOptions.column.stacking = 'normal';
    newBaseOptions.plotOptions.column.colorByPoint = false;
    newBaseOptions.plotOptions.column.pointWidth = 50;
    newBaseOptions.plotOptions.column.borderWidth = 0;
    newBaseOptions.plotOptions.series.animation = {
        duration: 0
    };
    newBaseOptions.plotOptions.series.fontSize = '14px';
    newBaseOptions.legend = {
          enabled: false
    };
    newBaseOptions.tooltip.followPointer = true;
    newBaseOptions.tooltip.useHTML = true;
    newBaseOptions.tooltip.backgroundColor = 'transparent';
    newBaseOptions.tooltip.formatter = function() {
        const count = (this.point.y <= 20) ? '&le; 20' : this.point.y;
        const percentage = ((count / this.point.total) * 100).toFixed();
        this.point.toolTipHelpText = `
            <div class="survey-answer-tooltip">
            <strong>${this.point.series.name}</strong>
            <span>${count} Participants </span>
            <span>${percentage}% of all participants who took this version of survey</span>
            <span>${this.point.total} Total </div></span>`;
        return this.point.toolTipHelpText;
    };
    newBaseOptions.colors = colors;
    this.setState({options: newBaseOptions});
  }

  render() {
      const {options, answerChartInfo} = this.state;
      return <React.Fragment>
        <style>{cssStyle}</style>
        <div className='answer-chart-layout'>
        {options && <HighchartsReact highcharts={highCharts} options={options} className='standard-chart'
        updateArgs={[true]}/>}
        <div className='legend'>
                <div className='legend-inner'>
                    {
                        answerChartInfo.map((answer, index) => {
                        const colorStyle = {color : answer.color};
                        return <div className='legend-item' key={index}>
                        <span><i className='fas fa-circle' style={colorStyle}></i></span>
                                            <span> {answer.answerValue}</span>
                        </div>;
                        })
                    }
                </div>
            </div>
        </div>
      </React.Fragment>;
    }
}

@Component({
  selector: 'app-survey-answer-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./chart-survey-answers.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SurveyAnswerChartWrapperComponent extends BaseReactWrapper {
  @Input() versionAnalysis: any;
  @Input() countAnalysis: any;

  constructor() {
    super(SurveyAnswerChartReactComponent, ['versionAnalysis', 'countAnalysis']);
  }
}
