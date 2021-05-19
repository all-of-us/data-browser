import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-survey-view',
  templateUrl: './survey-view.component.html',
})

export class SurveyViewComponent {
  domainId: string;
  searchWord: string;
  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.domainId = params.id.toLowerCase();
    });
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchWord = params.search;
      }
    });
  }
}
