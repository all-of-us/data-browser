import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-rd-table',
  templateUrl: './rd-table.component.html',
  styleUrls: ['./rd-table.component.css']
})
export class RdTableComponent implements OnChanges {

  @Input() tableData: any;

  constructor() { }

  ngOnChanges() {
  }

}
