import { Component,Injector, Input, OnChanges } from '@angular/core';
import { Concept } from '../../../../publicGenerated/model/concept';
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
    console.log(this.analysis,'sup analysis');
    console.log(this.chartTitle,'sup chartTitle');
    console.log(this.domainType,'sup domainType');
    console.log(this.domainCountAnalysis,'sup domainCountAnalysis');
    
    this.buildChart();
    this.chartOptions = this.getChartOptions();
    this.chartOptions.plotOptions.series.pointWidth = 30;
    this.chartOptions.yAxis.title.text = 'Participant Count';
    this.chartOptions.xAxis.title.text = 'Top Concepts';
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
    for (const concept of this.analysis.results) {
      const count = (concept.countValue <= 20) ? '&le; 20' : concept.countValue;
      const ageResult = this.domainCountAnalysis.ageCountAnalysis.results;
      const percentage = Number(((concept.countValue / ageResult.countValue) * 100).toFixed());
      const totalCount = (ageResult.countValue <= 20) ? '&le; 20' : ageResult.countValue;
      // console.log(count,ageResult,percentage,totalCount);
      
      this.pointData.push({
        toolTipHelpText:
        '<b>' + count + '</b>' + ' participants were ages within range ' +
        concept.analysisStratumName + ' when this medical concept first occurred and that is <b>' +
        percentage + '</b>' + '% of all participants with the same criteria. (total count = '
        + totalCount + '</b>)',
        name: concept.analysisStratumName,
        y: concept.countValue,
        concept: concept,
        analysisId: 'Age'
      });
      this.categoryArr.push([concept.analysisStratumName]);
    }
  }

}
