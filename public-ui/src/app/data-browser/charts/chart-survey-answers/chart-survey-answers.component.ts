import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-survey-answers',
  templateUrl: './chart-survey-answers.component.html',
  styleUrls: ['./chart-survey-answers.component.css']
})
export class ChartSurveyAnswersComponent extends ChartBaseComponent implements OnChanges {
  chartOptions: any;
  chartSeries: any[];
  colors: any[];
  answers: any;
  answerChartInfo: any[];
  monthOrder = ['May', 'June', 'July/August'];
  @Input() versionAnalysis: any[];
  @Input() countAnalysis: any[];
  constructor(injector: Injector) {
    super(injector);
    this.categoryArr = [];
    this.colors = [];
  }

  ngOnChanges() {
    this.answerChartInfo = [];
    this.countAnalysis.forEach(aCount => {
        this.answerChartInfo.push({
          color: aCount.color,
          totalCount: aCount.countValue,
          answerId: aCount.stratum3,
          answserValue: aCount.stratum4
        });
    });
    this.answerChartInfo.forEach(info => {
      this.colors.push(info.color);
    });
    this.sortAnswers(this.versionAnalysis);
    this.buildChart();
  }


  public buildChart() {
    this.chartObj = {
      type: 'column',
      backgroundColor: 'transparent'
    };
    this.pointData = [];
    this.chartOptions = this.getChartOptions();
    this.chartOptions.xAxis.categories = this.categoryArr;
    this.chartOptions.series = this.chartSeries;
    this.chartOptions.yAxis.title.text = 'Participant Count';
    this.chartOptions.yAxis.title.style.fontSize = '16px';
    const labelStyle = {
      style: {
        fontSize: '16px',
        fontFamily: 'GothamBook',
        color: '#262262'
      }
    };
    this.chartOptions.xAxis.labels = labelStyle;
    this.chartOptions.yAxis.labels = labelStyle;
    this.chartOptions.yAxis.title.margin = 35;
    this.chartOptions.yAxis.title.style = {
      fontFamily: 'GothamBook',
      padding: '1rem',
      color: '#262262'
    };

    this.chartOptions.plotOptions = {
      column: {
        stacking: 'normal',
        pointWidth: 50,
        borderWidth: 0
      },
      series: {
        animation: false,
        fontSize: '14px',
      },
    };
    this.chartOptions.legend = {
      enabled: false
    };
    this.chartOptions.tooltip = {
      followPointer: true,
      useHTML: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      color: '#262262',
      shadow: false,
      formatter: function () {
        const count = (this.point.y <= 20) ? '&le; 20' : this.point.y;
        this.point.toolTipHelpText = `
            <div class="survey-answer-tooltip">
            <strong>${this.point.series.name}</strong>
            <span>${count} Participants </span>
            <span>${this.point.total} Total </div></span>`;
        return this.point.toolTipHelpText;
      }
    };
    this.chartOptions.colors = this.colors;
  }

  public sortAnswers(answers: any[]) {
    const result = answers.reduce((r, a) => {
      r[a.stratum7] = [...r[a.stratum7] || [], a];
      return r;
    }, {});
    const payload = {};
    Object.keys(result).sort((a, b) => {
      return this.monthOrder.indexOf(a) - this.monthOrder.indexOf(b);
    }).forEach(key => {
      payload[key] = result[key];
    });
    this.conceptDist(payload);
  }

  public mapOrder(array: any[], order: any[], key: string) {
    array.sort(function (a, b) {
      const A = a[key], B = b[key];
      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
    });
    return array;
  }

  public conceptDist(sortedAnswers: any) {
    let tempArr: any[] = [];
    for (const prop in sortedAnswers) {
      if (sortedAnswers.hasOwnProperty(prop)) {
        this.categoryArr.push(prop);
        const answerOrder = this.answerChartInfo.map(p => p.answerId);
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
    this.chartSeries = tempArr;
  }

}
