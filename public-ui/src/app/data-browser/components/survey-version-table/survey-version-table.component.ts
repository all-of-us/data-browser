import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-survey-version-table',
  templateUrl: './survey-version-table.component.html',
  styleUrls: ['./survey-version-table.component.css', '../../../styles/template.css']
})
export class SurveyVersionTableComponent implements OnChanges {
  @Input() surveys: any;
  constructor() { }

  ngOnChanges() {
    this.surveys.sort((a1, a2) => {
            if (a1.monthNum.split('/')[0] < a2.monthNum.split('/')[0]) {
              return -1;
            }
            if (a1.monthNum.split('/')[0] > a2.monthNum.split('/')[0]) {
              return 1;
            }
            return 0;
          });
  }

}
