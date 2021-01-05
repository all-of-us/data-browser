import { Component, Injector, Input, OnChanges} from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'chart-biosex',
  templateUrl: './chart-biosex.component.html',
  styleUrls: ['./chart-biosex.component.css']
})
export class ChartBiosexComponent extends ChartBaseComponent implements OnChanges {
  chartOptions: any;
  @Input() genderCountAnalysis: any;
  @Input() chartType = 'bar';
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
    this.chartOptions.yAxis.title.style.color = '#262262';
    this.chartOptions.yAxis.gridLineWidth = 1;
    this.chartOptions.yAxis.gridLineColor = '#F0F0F0';

  }
  public buildChart() {
    this.pointData = [];
    this.categoryArr = [];
    this.conceptDist();
    this.chartObj = {
      type: this.chartType,
      backgroundColor: 'transparent'
    };
  }

  public conceptDist() {
    for (const concept of this.concepts.results) {
      const genderCountResults = this.genderCountAnalysis.results.filter(r =>
      r.stratum4 === concept.stratum2);
      let genderCountTooltip = '';
      let percentage;
      if (genderCountResults && genderCountResults.length > 0) {
            percentage = ((concept.countValue / genderCountResults[0].countValue) * 100).toFixed();
            if (percentage < 1) {
                percentage =
                ((concept.countValue / genderCountResults[0].countValue) * 100)
                .toFixed(1);
            }
            const totCount = (genderCountResults[0].countValue <= 20) ? '&le; 20'
            : genderCountResults[0].countValue;
            genderCountTooltip += 'Total Count = <strong>' + totCount + '</strong>';
      }
      const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
      this.pointData.push({
        toolTipHelpText: '<div class="bio-sex-tooltip"><strong>' +
          count + '</strong>' +
          ' participants <br> who had <strong>' + concept.analysisStratumName +
          '</strong> as sex assigned at birth and that is <strong>' +
           percentage + '% </strong> of all participants with the same criteria. ('
           + genderCountTooltip + ')</div>',
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
