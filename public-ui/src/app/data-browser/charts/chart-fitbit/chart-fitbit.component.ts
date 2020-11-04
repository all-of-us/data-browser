import { Component, Injector, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-fitbit',
  templateUrl: './chart-fitbit.component.html',
  styleUrls: ['./chart-fitbit.component.css']
})
export class ChartFitbitComponent extends ChartBaseComponent implements OnChanges {
  chartOptions: any;
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges() {
    this.buildChart();
    this.chartOptions = this.getChartOptions();
    this.chartOptions.plotOptions.series.pointWidth = 20;
    this.chartOptions.yAxis.title.text = 'Participant Count';
    this.chartOptions.xAxis.title.text = '';
    this.chartOptions.yAxis.title.style.fontSize = '14px';
    this.chartOptions.xAxis.title.style.fontSize = '14px';
    this.chartOptions.yAxis.gridLineWidth = 1;
    this.chartOptions.yAxis.gridLineColor = '#F0F0F0';
    this.chartOptions.xAxis.gridLineWidth = 1;
    this.chartOptions.xAxis.gridLineColor = '#F0F0F0';
  }
  public buildChart() {
    this.pointData = [];
    this.categoryArr = [];
    this.conceptDist();
    this.chartObj = {
      type: 'line',
      backgroundColor: 'transparent',
    };
  }

  public conceptDist() {
    console.log(this.concepts,'ssdfdsf');
    
    for (const concept of this.concepts.results) {
      this.pointData.push({
        toolTipHelpText: '<div class="fitbit-tooltip"><strong>' + concept.countValue +
        ' </strong> participants had <br>'
        + concept.stratum1 + '<br> by <strong>' + concept.stratum2 + '</strong> </div>',
        name: '',
        y: concept.countValue,
        concept: '',
        analysisId: ''
      });
      this.categoryArr.push(concept.stratum2);
    }
  }
}
