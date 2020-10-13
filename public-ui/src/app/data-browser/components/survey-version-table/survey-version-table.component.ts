import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-survey-version-table',
  templateUrl: './survey-version-table.component.html',
  styleUrls: ['./survey-version-table.component.css','../../../styles/template.css']
})
export class SurveyVersionTableComponent implements OnChanges {
  @Input() surveys: any;
  constructor() { }

  ngOnChanges() {
    console.log(this.surveys,'hello surveys in component');
    
  }

}
