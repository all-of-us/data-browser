import { Component, Injector, Input } from '@angular/core';
import { ChartService } from '../chart.service';
import { Concept } from '../../../../publicGenerated/model/concept';

@Component({
  selector: 'app-chart-base',
  templateUrl: './chart-base.component.html',
  styleUrls: ['./chart-base.component.css']
})
export class ChartBaseComponent {
  protected chartService: ChartService;
  categoryArr: any[];
  @Input() concepts: Concept[];



  constructor(injector: Injector) {
    this.chartService = injector.get(ChartService);
  }


  // getChartOptions() {
  //   console.log(this.series(),'do it now');
    
  //   return {
  //     chart: this.chartObject(),
  //     colors: [this.chartService.barColor],
  //     title: this.chartService.noTitle,
  //     xAxis: {
  //       categories: this.categoryArr,
  //       title: this.chartService.noTitle
  //     },
  //     yAxis: {
  //       title: this.chartService.noTitle
  //     },
  //     legend: this.chartService.notEnabled,
  //     credits: this.chartService.notEnabled,
  //     plotOptions: {
  //       series: {
  //         pointWidth: this.chartService.barWidth
  //       }
  //     },
  //     series: this.series(),
  //   };
  // }

  chartObject() {
    return {
      type: 'bar',
      backgroundColor: 'transparent'
    };
  }

  series() {
    return [{
      data: [1, 20]
    }];
  }

  categories() {
    return ['replace', 'me'];
  }

}
