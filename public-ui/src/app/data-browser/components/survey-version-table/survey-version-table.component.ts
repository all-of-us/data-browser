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
    // sort by month order
    const allMonths = [
    'january',
    'febuary',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'];
    this.surveys.sort((a: any, b: any) => {
      return allMonths.indexOf(a.month.toLowerCase()) - allMonths.indexOf(b.month.toLowerCase());
    });
  }

}
