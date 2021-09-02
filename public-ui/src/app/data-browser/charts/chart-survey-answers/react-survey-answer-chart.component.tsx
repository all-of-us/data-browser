import { getBaseOptions, VERSION_NAME_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { reactStyles } from 'app/utils';
import { eightColors, eighteenColors, fourteenColors, tenColors, twentyFiveColors } from 'app/utils/colors';
import * as highCharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as React from 'react';

const styles = reactStyles({
    answerChartLayout: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    legend: {
        padding: '1rem',
        paddingBottom: '2rem',
        maxWidth: '15rem',
    },
    legendInner: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        overflowY: 'auto',
        maxHeight: '20rem'
    },
    legendItem: {
        display: 'grid',
        gridTemplateColumns: '1rem 1fr',
        fontSize: '.8em',
        paddingBottom: '.5em'
    },
    standardChart: {
        display: 'block',
        backgroundSize: 'contain',
        height: 'auto',
        width: '75%',
        padding: '1rem 3rem'
    }
});

const cssStyle = `
:host {
    display: block;
    padding:1rem 3rem;
}
`;

const monthOrder = ['1', '2', '3', '4', '5', '6'];

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
            aCount['color'] = eighteenColors[i];
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
    newBaseOptions.xAxis.categories = categoryArr.map(item  => VERSION_NAME_MAP[item]);
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
              <span>${this.point.total} Total </span>
            </div>`;
        return this.point.toolTipHelpText;
    };
    newBaseOptions.colors = colors;
    this.setState({options: newBaseOptions});
  }

  render() {
    const {options, answerChartInfo} = this.state;
    return <React.Fragment>
      <style>{cssStyle}</style>
      <div className='answer-chart-layout' style={styles.answerChartLayout}>
        {options && <HighchartsReact highcharts={highCharts}
                                     options={options}
                                     className='standard-chart'
                                     style={styles.standardChart}
                                     updateArgs={[true]}/>}
        <div className='legend' style={styles.legend}>
          <div className='legend-inner' style={styles.legendInner}>
            {answerChartInfo.map((answer, index) => {
              const colorStyle = {color : answer.color};
              return <div className='legend-item'
                          key={index}
                          style={styles.legendItem}>
                <span>
                  <i className='fas fa-circle' style={colorStyle}/>
                </span>
                <span> {answer.answerValue}</span>
              </div>;
            })}
          </div>
        </div>
      </div>
    </React.Fragment>;
  }
}
