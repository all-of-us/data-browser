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
  monthOrder = ['May', 'June', 'July/August'];
  @Input() answerChartInfo: any;
  constructor(injector: Injector) {
    super(injector);
    this.categoryArr = [];
    this.colors = [];
  }

  ngOnChanges() {
    this.answers = this.concepts;
    this.answerChartInfo.forEach(info => {
      this.colors.push(info.color);
    });
    this.sortAnswers(this.answers);
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

    this.chartOptions.xAxis.labels = {
      style: {
        fontSize: '16px',
        fontFamily: 'GothamBook'
      }
    };
    this.chartOptions.yAxis.labels = {
      style: {
        fontSize: '16px',
        fontFamily: 'GothamBook'
      }
    };
    this.chartOptions.yAxis.title.margin = 35;
    this.chartOptions.yAxis.title.style.fontFamily = 'GothamBook';
    this.chartOptions.yAxis.title.style.padding = '1rem';

    this.chartOptions.plotOptions = {
      column: {
        stacking: 'normal',
        pointWidth: 50,
        borderWidth: 0
      },
      series: {
        animation: false,
        fontSize: '14px'
      }
    };
    this.chartOptions.legend = {
      enabled: false
      // align: 'right',
      // x: 100,
      // verticalAlign: 'top',
      // y: 100,
      // floating: true,
      // backgroundColor: 'white',
      // shadow: false
    };
    this.chartOptions.tooltip = {
      followPointer: true,
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
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
