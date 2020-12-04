import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-fitbit',
  templateUrl: './chart-fitbit.component.html',
  styleUrls: ['./chart-fitbit.component.css']
})
export class ChartFitbitComponent extends ChartBaseComponent implements OnChanges {
  chartOptions: any;
  @Input() countAnalysis: any;
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
    this.chartOptions.tooltip.positioner = undefined;
    this.chartOptions.tooltip.outside = true;
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
    for (const concept of this.concepts.results) {
      const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
      console.log(this.countAnalysis.results[0]);
      const totalCount = (this.countAnalysis && this.countAnalysis.results) ?
      this.countAnalysis.results[0].countValue : 0;
      const percentage = ((concept.countValue/totalCount)*100).toFixed();
      this.pointData.push({
        toolTipHelpText: '<div class="fitbit-tooltip"><strong>' + count +
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
      this.categoryArr.push(concept.stratum2);
    }
  }
}
