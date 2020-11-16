import { Component, Injector, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-survey-answers',
  templateUrl: './chart-survey-answers.component.html',
  styleUrls: ['./chart-survey-answers.component.css']
})
export class ChartSurveyAnswersComponent extends ChartBaseComponent implements OnChanges {

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges() {
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

}
