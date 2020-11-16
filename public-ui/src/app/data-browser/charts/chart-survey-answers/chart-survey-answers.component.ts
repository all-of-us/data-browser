import { Component, Injector, OnChanges } from '@angular/core';
import { keyframes } from '@angular/core/src/animation/dsl';
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
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges() {
    this.chartOptions = this.getChartOptions();
    this.concepts = this.sortAnswers(this.concepts);
    this.buildChart();
    this.chartOptions.series = this.chartSeries;
  }


  public buildChart() {
    this.pointData = [];
    this.categoryArr = [];
    this.conceptDist();

    this.chartObj = {
      type: 'bar',
      backgroundColor: 'transparent'
    };
  }

  public sortAnswers(answers: any[]) {
    const result = answers.reduce((r, a) => {
      r[a.stratum7] = [...r[a.stratum7] || [], a];
      return r;
    }, {});
    return result;
  }


  public conceptDist() {
    console.log(this.concepts);
    const tempArr = [];
    for (const prop in this.concepts) {
      if (this.concepts.hasOwnProperty(prop)) {
        this.categoryArr.push(prop);
        tempArr.push({
          name: prop,
          data: []
        });
        this.concepts[prop].forEach(answer => {
          
        });
      }
    }

  }

}
