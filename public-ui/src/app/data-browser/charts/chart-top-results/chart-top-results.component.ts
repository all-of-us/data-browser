import { Component, EventEmitter, Injector, OnChanges, Output } from '@angular/core';
import { ChartBaseComponent } from 'app/data-browser/charts/chart-base/chart-base.component';
import { Concept } from 'publicGenerated/model/concept';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'chart-top-results',
  templateUrl: './chart-top-results.component.html',
  styleUrls: ['./chart-top-results.component.css', '../chart-base/chart-base.component.css']
})
export class ChartTopResultsComponent extends ChartBaseComponent implements OnChanges {
  chartOptions: any;
  @Output() topResultSelected = new EventEmitter<Concept>();
  constructor(injector: Injector) {
    super(injector);
  }


  ngOnChanges() {
    this.buildChart();
    this.chartOptions = this.getChartOptions();
    this.chartOptions.plotOptions.series.pointWidth = 20;
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
      type: 'bar',
      backgroundColor: 'transparent',
    };
    this.barPlotOptions = {
      shadow: false,
      borderColor: null,
      cursor: 'pointer',
      events: {
        click: (event) => this.barClick(event)
      }
    };
  }

  public barClick(e) {
    this.topResultSelected.emit(e.point.concept);
  }

  public conceptDist() {
    for (const concept of this.concepts) {
      this.pointData.push({
        toolTipHelpText: this.toolTip(concept),
        name: concept.conceptName + ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ',
        y: concept.countValue,
        concept: concept,
        analysisId: 'topConcepts'
      });
      this.categoryArr.push(concept.conceptName);
    }
  }

  public toolTip(concept: Concept) {
    let toolTipText;
    let count = '';
    if (concept.countValue <= 20) {
        count = '&le; 20';
    } else {
        count = concept.countValue.toString();
    }
    toolTipText = '<div class="chart-tooltip">' + concept.conceptName +
      ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ' +
      '<br/>' + 'Participant Count: ' + '<strong>' + count + '</strong>' + '</div>';
    return toolTipText;
  }
}


