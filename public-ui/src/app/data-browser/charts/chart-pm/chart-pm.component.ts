import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ChartBaseComponent } from '../chart-base/chart-base.component';

@Component({
  selector: 'app-chart-pm',
  templateUrl: './chart-pm.component.html',
  styleUrls: ['./chart-pm.component.css']
})
export class ChartPmComponent extends ChartBaseComponent implements OnChanges {

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnChanges() {
  }

}
