import { Component, Injector, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  selector: 'chart-top-results',
  templateUrl: './chart-top-results.component.html',
  styleUrls: ['./chart-top-results.component.css']
})
export class ChartTopResultsComponent extends ChartBaseComponent implements OnChanges {
  categoryArr: any[];
  chartOptions: any;
  constructor(injector: Injector) {
    super(injector);

  }

  ngOnChanges() {
    console.log(this.concepts, "concept");
    // sort high to low

    this.concepts = this.concepts.sort((a, b) => {

      if (a.countValue < b.countValue) {
        return 1;
      }
      if (a.countValue > b.countValue) {
        return -1;
      }
      return 0;
    });


    if (this.concepts) {
      this.chartOptions = {
        chart: this.chartObject(),
        colors: [this.chartService.barColor],
        title: this.chartService.noTitle,
        xAxis: {
          categories: this.categoryArr,
          title: this.chartService.noTitle
        },
        yAxis: {
          title: this.chartService.noTitle
        },
        legend: this.chartService.notEnabled,
        credits: this.chartService.notEnabled,
        plotOptions: {
          series: {
            pointWidth: 20
          },
          bar: {
            shadow: false,
            borderColor: null,
            colorByPoint: true,
            groupPadding: 0,
            pointPadding: 0,
            dataLabels: {
              enabled: false,
            },
          }
        },
        series: this.topSeries(),
      };
      console.log(this.categoryArr,'classsss');
    }
    
  }


  topSeries() {
    if (this.concepts && this.concepts.length > 0) {
      const data = [];
      this.categoryArr = [];
      for (const concept of this.concepts) {
        let toolTipText = '';

        if (concept.countValue > 20) {
          toolTipText = concept.conceptName + ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ' +
            '<br/>' + 'Pariticipant Count: ' + '<b>' + concept.countValue + '</b>';
        } else {
          toolTipText = concept.conceptName + ' (' + concept.vocabularyId + '-' + concept.conceptCode + ') ' +
            '<br/>' + 'Pariticipant Count: ';
        }
        data.push(concept.countValue);
        this.categoryArr.push(concept.conceptName);

      }
      return [{ data: data }];
    }
  }
}
