import { Component, Injector, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-biosex',
  templateUrl: './chart-biosex.component.html',
  styleUrls: ['./chart-biosex.component.css']
})
export class ChartBiosexComponent extends ChartBaseComponent implements OnChanges {

  chartOptions: any;
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges() {
    console.log(this.concepts, 'from biosex');
    this.buildChart();
    this.chartOptions = this.getChartOptions();
    this.chartOptions.plotOptions.series.pointWidth = 50;
    this.chartOptions.yAxis.title.text = 'Participant Count';
    this.chartOptions.xAxis.title.text = '';
    this.chartOptions.yAxis.title.style.fontSize = '14px';
    this.chartOptions.xAxis.title.style.fontSize = '14px';
    this.chartOptions.yAxis.title.style.color = '#262262';
    this.chartOptions.yAxis.gridLineWidth = 1;
    this.chartOptions.yAxis.gridLineColor = '#F0F0F0';

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

  public conceptDist() {
    for (const concept of this.concepts.results) {
      const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
      this.pointData.push({
        toolTipHelpText: '<div class="bio-sex-tooltip"><strong>' +
          count + '</strong>' +
          ' participants <br> who had <strong>' + concept.analysisStratumName +
          '</strong> as sex assigned at birth </div>',
        name: '',
        y: concept.countValue,
        concept: '',
        analysisId: ''
      });
      this.categoryArr.push(concept.analysisStratumName);
    }
  }

}
