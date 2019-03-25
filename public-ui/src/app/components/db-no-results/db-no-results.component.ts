import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiModule, DataBrowserService, DomainInfosAndSurveyModulesResponse } from 'publicGenerated';
import { ISubscription } from 'rxjs/Subscription';
import { DbConfigService } from '../../utils/db-config.service';
@Component({
  selector: 'app-db-no-results',
  templateUrl: './db-no-results.component.html',
  styleUrls: ['./db-no-results.component.css', '../../styles/template.css']
})
export class DbNoResultsComponent implements OnChanges, OnDestroy {
  @Input() searchText;
  @Output() newDomain: EventEmitter<any> = new EventEmitter();
  results;
  loading;
  prevSearchText: string;
  private subscriptions: ISubscription[] = [];
  constructor(
    private api: DataBrowserService,
    private router: Router,
    private dbc: DbConfigService) {
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
      this.subscriptions.push(this.searchText.valueChanges
        .debounceTime(300)
        .distinctUntilChanged()
        .subscribe(
        (query) => {
          localStorage.setItem('searchText', query);
        }));
        this.searchDomains(this.searchText.value);
      }
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  public newEhrDomain(r) {
    // payload is the domain info that we are switching to
    const payload = {
      domain: r,
      searchText: this.searchText.value
    };
    localStorage.setItem('ehrDomain', JSON.stringify(r));
    localStorage.setItem('searchText', this.prevSearchText);
    this.newDomain.emit(payload);
  }

  public goToResult(r) {
    console.log(r, 'r is passed');
    console.log(this.results, 'check r against');

    if (this.results && this.results.domainInfos) {
      this.results.domainInfos.forEach(domain => {
        if (r.domain === domain.domain) {
          const payload = {
            domain: r,
            searchText: this.searchText.value
          };
          localStorage.setItem('ehrDomain', JSON.stringify(r));
          this.newDomain.emit(payload);
          this.router.navigateByUrl('ehr/' + r.domain.toLowerCase());
        }
      });

    }
    if (this.results && this.results.surveyModules) {
      this.results.surveyModules.forEach(survey => {
        if (r.conceptId === survey.conceptId) {
          localStorage.setItem('surveyModule', JSON.stringify(r));
          localStorage.setItem('searchText', this.searchText.value);
          this.dbc.conceptIdNames.forEach(idName => {
            if (r.conceptId === idName.conceptId) {
              this.router.navigateByUrl('survey/' + idName.conceptName);
            }
          });
        }
      });
    }
  }

  public searchDomains(query: string) {
    this.subscriptions.push(this.api.getDomainSearchResults(query).subscribe(results => {
      this.results = results;
      console.log(this.results, query);
      this.loading = false;
    }));
  }

}
