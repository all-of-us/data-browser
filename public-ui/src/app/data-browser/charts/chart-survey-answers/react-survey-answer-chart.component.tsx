import * as React from "react";
import * as highCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import {
  getBaseOptions,
  VERSION_NAME_MAP_COPE,
  VERSION_NAME_MAP_COPE_MINUTE,
} from "app/data-browser/charts/react-base-chart/base-chart.service";
import { reactStyles } from "app/utils";
import {
  eightColors,
  eighteenColors,
  fourteenColors,
  tenColors,
  twentyFiveColors,
} from "app/utils/colors";

const styles = reactStyles({
  answerChartLayout: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  legend: {
    padding: "1rem",
    paddingBottom: "2rem",
    maxWidth: "15rem",
  },
  legendInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    overflowY: "auto",
    maxHeight: "20rem",
  },
  legendItem: {
    display: "grid",
    gridTemplateColumns: "1rem 1fr",
    fontSize: ".8em",
    paddingBottom: ".5em",
  },
  standardChart: {
    display: "block",
    backgroundSize: "contain",
    height: "auto",
    width: "75%",
    padding: "1rem 3rem",
  },
});

const cssStyle = `
:host {
    display: block;
    padding:1rem 3rem;
}
`;

const monthOrder = ["1", "2", "3", "4", "5", "6"];

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
  surveyVersions: any;
}

export class SurveyAnswerChartReactComponent extends React.Component<
  Props,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      options: null,
      answerChartInfo: [],
      chartSeries: [],
      categoryArr: [],
      colors: [],
    };
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
        aCount.color = eightColors[i];
      } else if (answerCount > 8 && answerCount <= 10) {
        aCount.color = tenColors[i];
      } else if (answerCount <= 14) {
        aCount.color = fourteenColors[i];
      } else if (answerCount <= 18) {
        aCount.color = eighteenColors[i];
      } else if (answerCount > 18) {
        aCount.color = twentyFiveColors[i];
      }
      answerChartInfo.push({
        color: aCount.color,
        totalCount: aCount.countValue,
        answerId: aCount.stratum3,
        answerValue: aCount.stratum4,
      });
      colors.push(aCount.color);
    });
    this.setState({ answerChartInfo: answerChartInfo, colors: colors }, () => {
      this.sortAnswers();
    });
  }

  public sortAnswers() {
    const { versionAnalysis } = this.props;
    const surveyConceptId =
      versionAnalysis !== null ? versionAnalysis[0].stratum1 : 0;
    const result = versionAnalysis.reduce((r, a) => {
      r[a.stratum7] = [...(r[a.stratum7] || []), a];
      return r;
    }, {});
    const payload = {};
    Object.keys(result)
      .sort((a, b) => {
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
      })
      .forEach((key) => {
        payload[key] = result[key];
      });
    return this.conceptDist(payload, surveyConceptId);
  }

  public mapOrder(array: any[], order: any[], key: string) {
    array.sort((a, b) => order.indexOf(a[key]) - order.indexOf(b[key]));
  }

  public conceptDist(sortedAnswers: any, surveyConceptId: any) {
    let tempArr: any[] = [];
    const categoryArr = [];
    const { answerChartInfo } = this.state;
    for (const val of answerChartInfo.map((a) => a.answerValue)) {
      tempArr.push({
        name: val,
        data: [],
        tooltip: []
      });
    }
    // remove duplicates
    tempArr = Array.from(new Set(tempArr.map((x) => JSON.stringify(x)))).map(
      (x) => JSON.parse(x)
    );
    for (const prop in sortedAnswers) {
      if (sortedAnswers.hasOwnProperty(prop)) {
        categoryArr.push(prop);
        tempArr.forEach((stack) => {

          let filterAnswer = sortedAnswers[prop].filter( a => a['stratum4'] === stack.name );
          if (filterAnswer.length > 0) {
            stack.data.push(filterAnswer[0].countValue);
            stack.tooltip.push('');
          } else {
            stack.data.push(0);
            stack.tooltip.push('Not present in this version of the survey');
          }
          /*
          sortedAnswers[prop].forEach((answer) => {
            if (stack.name === answer.stratum4) {
              stack.data.push(answer.countValue);
            }
          });
          */
        });

      }
    }
    console.log(tempArr);
    this.setState({ chartSeries: tempArr, categoryArr: categoryArr }, () => {
      this.buildChartData(surveyConceptId);
    });
  }

  buildChartData(surveyConceptId: any) {
    const { categoryArr, chartSeries, colors } = this.state;
    const { surveyVersions, versionAnalysis } = this.props;
    const newBaseOptions = getBaseOptions();
    newBaseOptions.chart.type = "column";
    newBaseOptions.xAxis.categories = categoryArr.map((item) =>
      surveyConceptId === "1333342"
        ? VERSION_NAME_MAP_COPE[item]
        : VERSION_NAME_MAP_COPE_MINUTE[item]
    );
    newBaseOptions.series = chartSeries;
    newBaseOptions.yAxis.title.text = "Participant Count";
    newBaseOptions.yAxis.title.style.fontSize = "16px";
    newBaseOptions.xAxis.labels.style.fontSize = "14px";
    newBaseOptions.yAxis.labels.style.fontSize = "16px";
    newBaseOptions.yAxis.title.style.padding = "1rem";
    newBaseOptions.plotOptions.column.stacking = "normal";
    newBaseOptions.plotOptions.column.minPointLength = 3;
    newBaseOptions.plotOptions.column.colorByPoint = false;
    newBaseOptions.plotOptions.column.pointWidth = 50;
    newBaseOptions.plotOptions.column.borderWidth = 0;
    newBaseOptions.plotOptions.series.animation = {
      duration: 0,
    };
    newBaseOptions.plotOptions.series.fontSize = "14px";
    newBaseOptions.legend = {
      enabled: false,
    };
    newBaseOptions.tooltip.followPointer = true;
    newBaseOptions.tooltip.useHTML = true;
    newBaseOptions.tooltip.backgroundColor = "transparent";
    newBaseOptions.tooltip.formatter = function () {
      const count = this.point.y <= 20 ? "&le; 20" : this.point.y;
      let cat = this.point.category.split(' ');
      let toolTipText = this.point.series.name;
      const surveyVersion = surveyVersions.find((obj) => {
        return (obj.monthName === cat[0] && obj.year === cat[1]);
      });
      const surveyVersionParticipantCounts = surveyVersion ? surveyVersion.participants : 0;
      let percentage = (this.point.y <= 20) ? ((20 / surveyVersionParticipantCounts) * 100).toFixed() :
        ((count / surveyVersionParticipantCounts) * 100).toFixed();
      if (this.point.y == 0 && this.point.series.name.toLowerCase() !== 'did not answer') {
        toolTipText += '\n This option was not available in this version of the survey';
      }
      this.point.toolTipHelpText = `
            <div class="survey-answer-tooltip">
              <strong>${toolTipText}</strong>
              <span>${count} Participants </span>
              <span>${percentage}% of all participants who took this version of survey</span>
              <span>${surveyVersionParticipantCounts} Total </span>
            </div>`;
      return this.point.toolTipHelpText;
    };
    newBaseOptions.colors = colors;
    console.log(newBaseOptions);
    this.setState({ options: newBaseOptions });
  }

  render() {
    const { options, answerChartInfo } = this.state;
    return (
      <React.Fragment>
        <style>{cssStyle}</style>
        <div className="answer-chart-layout" style={styles.answerChartLayout}>
          {options && (
            <HighchartsReact
              highcharts={highCharts}
              options={options}
              className="standard-chart"
              style={styles.standardChart}
              updateArgs={[true]}
            />
          )}
          <div className="legend" style={styles.legend}>
            <div className="legend-inner" style={styles.legendInner}>
              {answerChartInfo.map((answer, index) => {
                const colorStyle = { color: answer.color };
                return (
                  <div
                    className="legend-item"
                    key={index}
                    style={styles.legendItem}
                  >
                    <span>
                      <i className="fas fa-circle" style={colorStyle} />
                    </span>
                    <span> {answer.answerValue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
