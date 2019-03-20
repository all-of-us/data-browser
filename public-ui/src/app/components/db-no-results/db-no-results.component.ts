import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DataBrowserService, DomainInfosAndSurveyModulesResponse, ApiModule } from 'publicGenerated';
@Component({
  selector: 'app-db-no-results',
  templateUrl: './db-no-results.component.html',
  styleUrls: ['./db-no-results.component.css']
})
export class DbNoResultsComponent implements OnChanges {
  @Input() searchText: string;
  results;
  loading;
  prevSearchText: string;
  constructor(private api: DataBrowserService, private router: Router) { }

  ngOnChanges() {
    this.prevSearchText = localStorage.getItem('searchText');
    if (this.searchText) {
      this.loading = true;
      this.api.getDomainSearchResults(this.searchText.value).subscribe(results =>{
        this.results = results;
        console.log(this.results, this.searchText.value);
        this.loading=false;
      });
    }
  }

  public viewEhrDomain(r) {
    console.log(r);
    
    localStorage.setItem('ehrDomain', JSON.stringify(r));
    localStorage.setItem('searchText', this.prevSearchText);
    // this.router.navigateByUrl('ehr/' + r.domain.toLowerCase());
  }


}
