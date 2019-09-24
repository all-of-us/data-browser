import { Component, EventEmitter, Injector, OnChanges, Output } from '@angular/core';
import { Concept } from '../../../../publicGenerated/model/concept';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

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
        concept: concept
      });
      this.categoryArr.push(concept.conceptName);
    }
  }

  public toolTip(concept: Concept) {
    let toolTipText;
    if (concept.countValue > 20) {
      let tempConceptNameText = '';
      if (concept.conceptName.length > 100) {
        const conceptNameSplit = this.chunkString(concept.conceptName, 100);
        for (const name of conceptNameSplit) {
          if (name) {
            tempConceptNameText += name + '</br>';
          }
        }
      } else {
        tempConceptNameText = concept.conceptName;
      }
      toolTipText = tempConceptNameText +
        ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ' +
        '<br/>' + '<b> Pariticipant Count: ' + '</b>' + concept.countValue;
    } else {
      toolTipText = concept.conceptName +
        ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ' +
        '<br/>' + '<b> Pariticipant Count: </b>';
    }
    return toolTipText;
  }

  private chunkString(str: string, limit: number) {
    const input = str.trim().split(' ');
    let [index, output] = [0, []];
    output[index] = '';
    input.forEach(word => {
      const temp = `${output[index]} ${word}`.trim();
      if (temp.length <= limit) {
        output[index] = temp;
      } else {
        index++;
        output[index] = word;
      }
    });
    return output;
  }
}


