import { Component, Injector, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-age',
  templateUrl: './chart-age.component.html',
  styleUrls: ['./chart-age.component.css']
})
export class ChartAgeComponent extends ChartBaseComponent implements OnChanges {
  chartOptions: any;
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges() {
    this.buildChart();
    this.chartOptions = this.getChartOptions();
    this.chartOptions.plotOptions.series.pointWidth = 50;
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
      type: 'column',
      backgroundColor: 'transparent',
    };
  }

  public conceptDist() {
    for (const concept of this.concepts.results) {
      const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
      this.pointData.push({
        toolTipHelpText: '<div class="age-tooltip"><strong>' + count
        + '</strong> participants where ages within range of <strong>' +
        concept.analysisStratumName + '</strong></div>',
        name: concept.analysisStratumName,
        y: concept.countValue,
        concept: '',
        analysisId: ''
      });
      this.categoryArr.push(concept.analysisStratumName);
    }
    this.pointData = this.pointData.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    }
    );
    this.categoryArr = this.categoryArr.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
      return 0;
    });
  }
}
