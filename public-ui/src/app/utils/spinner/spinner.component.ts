import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnChanges {

  constructor() { }
  @Input() loading: boolean;

  ngOnChanges() {
  }
}
