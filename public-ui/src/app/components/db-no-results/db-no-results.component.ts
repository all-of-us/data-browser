import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ApiModule, DataBrowserService, DomainInfosAndSurveyModulesResponse } from 'publicGenerated';
@Component({
  selector: 'app-db-no-results',
  templateUrl: './db-no-results.component.html',
  styleUrls: ['./db-no-results.component.css']
})
export class DbNoResultsComponent implements OnChanges {
  @Input() searchText;
  results;
  loading;
  prevSearchText: string;
  constructor(private api: DataBrowserService, private router: Router) {
  }

  ngOnChanges() {
    this.prevSearchText = localStorage.getItem('searchText');
    if (!this.prevSearchText) {
      this.prevSearchText = '';
    } else {
      this.searchText.setValue(this.prevSearchText);
    }
    if (this.searchText) {
      this.loading = true;
      localStorage.setItem('searchText', this.searchText.value);
      this.searchDomains(this.searchText.value);
    }
  }

  public viewEhrDomain(r) {
    localStorage.setItem('ehrDomain', JSON.stringify(r));
    localStorage.setItem('searchText', this.prevSearchText);
    this.router.navigateByUrl('ehr/' + r.domain.toLowerCase());
  }

  public searchDomains(query: string) {
    this.api.getDomainSearchResults(query).subscribe(results => {
      this.results = results;
      console.log(this.results, query);
      this.loading = false;
    });
  }

}
