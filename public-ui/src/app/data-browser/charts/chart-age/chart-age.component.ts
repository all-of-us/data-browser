import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-age',
  templateUrl: './chart-age.component.html',
  styleUrls: ['./chart-age.component.css']
})
export class ChartAgeComponent extends ChartBaseComponent implements OnChanges {
  @Input() analysis: any;
  @Input() chartTitle: any;
  @Input() domainType: any;
  @Input() domainCountAnalysis: any;


  chartOptions: any;
  constructor(injector: Injector) {
    super(injector);
  }


  ngOnChanges() {
    this.analysis.results.sort((a, b) => (a.analysisStratumName > b.analysisStratumName) ? 1 : -1);
    this.buildChart();
    this.chartOptions = this.getChartOptions();
    this.chartOptions.plotOptions.series.pointWidth = 30;
    this.chartOptions.yAxis.title.text = 'Participant Count';
    this.chartOptions.xAxis.title.text = 'Age When Physical Measurement was taken';
    this.chartOptions.yAxis.title.style.fontSize = '14px';
    this.chartOptions.xAxis.title.style.fontSize = '14px';
  }


  public buildChart() {
    this.pointData = [];
    this.categoryArr = [];
    this.conceptDist();
    this.chartObj = {
      type: 'column',
      backgroundColor: 'transparent',
    };
    this.barPlotOptions = {
      shadow: false,
      borderColor: null,
      cursor: 'pointer',
    };
  }

  public conceptDist() {
    for (const result of this.analysis.results) {
      const count = (result.countValue <= 20) ? '&le; 20' : result.countValue;
      const ageResult = this.domainCountAnalysis.ageCountAnalysis.results.
        filter(x => x.stratum4 === result.stratum2)[0];
      const percentage = Number(((result.countValue / ageResult.countValue) * 100).toFixed());
      const totalCount = (ageResult.countValue <= 20) ? '&le; 20' : ageResult.countValue;
      console.log(count, ageResult, percentage, totalCount);

      this.pointData.push({
        toolTipHelpText:
          '<b>' + count + '</b>' + ' participants were ages within range ' +
          result.analysisStratumName + ' when this medical concept first occurred and that is <b>' +
          percentage + '</b>' + '% of all participants with the same criteria. (total count = '
          + totalCount + '</b>)',
        name: result.analysisStratumName,
        y: result.countValue,
        concept: result,
        analysisId: 'Age'
      });
      this.categoryArr.push([result.analysisStratumName]);
    }

  }

}
