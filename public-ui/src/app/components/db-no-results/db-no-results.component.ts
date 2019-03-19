import { Component, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-db-no-results',
  templateUrl: './db-no-results.component.html',
  styleUrls: ['./db-no-results.component.css']
})
export class DbNoResultsComponent implements OnChanges {
  @Input() searchText: string;
  constructor() { }

  ngOnChanges() {
  }

}
