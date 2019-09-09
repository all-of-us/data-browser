import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BrowserInfoRx,
  ResponsiveSizeInfoRx, UserAgentInfoRx
} from 'ngx-responsive';
import { DataBrowserService, DomainInfosAndSurveyModulesResponse } from 'publicGenerated';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { ISubscription } from 'rxjs/Subscription';
import { MatchType } from '../../../../publicGenerated';
import { Concept } from '../../../../publicGenerated/model/concept';
import { ConceptListResponse } from '../../../../publicGenerated/model/conceptListResponse';
import { Domain } from '../../../../publicGenerated/model/domain';
import { SearchConceptsRequest } from '../../../../publicGenerated/model/searchConceptsRequest';
import { StandardConceptFilter } from '../../../../publicGenerated/model/standardConceptFilter';
import { DbConfigService } from '../../../utils/db-config.service';
import { GraphType } from '../../../utils/enum-defs';
import { TooltipService } from '../../../utils/tooltip.service';

/* This displays concept search for a Domain. */

@Component({
  selector: 'app-ehr-view',
  templateUrl: './ehr-view.component.html',
  styleUrls: [
    '../../../styles/template.css',
    '../../../styles/cards.css',
    './ehr-view.component.css'
  ]
})
export class EhrViewComponent implements OnInit, OnDestroy {
  domainId: string;
  title: string;
  subTitle: string;
  ehrDomain: any;
  searchText: FormControl = new FormControl();
  prevSearchText = '';
  searchResult: ConceptListResponse;
  items: any[] = [];
  standardConcepts: any[] = [];
  standardConceptIds: number[] = [];
  graphButtons: any = [];
  loading: boolean;
  totalParticipants: number;
  top10Results: any[] = []; // We graph top10 results
  private searchRequest: SearchConceptsRequest;
  private subscriptions: ISubscription[] = [];
  private initSearchSubscription: ISubscription = null;
  /* Show more synonyms when toggled */
  showMoreSynonyms = {};
  synonymString = {};
  /* Show different graphs depending on domain we are in */
  graphToShow = GraphType.BiologicalSex;
  showTopConcepts: boolean;
  medlinePlusLink: string;
  graphType = GraphType;
  treeData: any[];
  expanded = true;
  treeLoading = false;
  searchFromUrl: string;
  totalResults: number;
  numPages: number;
  currentPage = 1;
  selectedConcept: Concept;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private elm: ElementRef,
    private api: DataBrowserService,
    private tooltipText: TooltipService,
    public dbc: DbConfigService,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.domainId = this.dbc.routeToDomain[params.id];
      if (params.searchString === ' ') {
        this.router.navigate(
          ['ehr/' + this.dbc.domainToRoute[this.domainId].toLowerCase()]
        );
      } else {
        this.searchFromUrl = params.searchString;
      }
    });
    this.loadPage();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      for (const s of this.subscriptions) {
        s.unsubscribe();
      }
    }
    if (this.initSearchSubscription) {
      this.initSearchSubscription.unsubscribe();
    }
  }

  @HostListener('window:popstate', ['$event'])
  public onPopState(event: any) {
    if (this.searchText.value) {
      localStorage.setItem('searchTermBeforeBack', this.searchText.value);
    }
    this.searchText.setValue(null);
  }

  public loadPage() {
    this.loading = true;
    this.items = [];
    // Get search text from localStorage
    if (!this.prevSearchText) {
      if (this.searchFromUrl) {
        this.prevSearchText = this.searchFromUrl;
      } else {
        this.prevSearchText = '';
        this.prevSearchText = localStorage.getItem('searchText');
      }
    }
    this.searchText.setValue(this.prevSearchText);
    const domainObj = JSON.parse(localStorage.getItem('ehrDomain'));
    // if no domainObj or if the domain in the obj doesn't match the route
    if (!domainObj || domainObj.domain !== this.domainId) {
      this.getThisDomain();
    }
    this.setDomain();
    this.domainSetup(this.ehrDomain);
    this.showTopConcepts = true;
  }

  private domainSetup(domain) {
    if (domain) {
      // Set the graphs we want to show for this domain
      // Run search initially to filter to domain,
      // a empty search returns top ordered by count_value desc
      // Note, we save this in its own subscription so we can unsubscribe when they start typing
      // and these results don't trump the search results in case they come back slower
      this.totalParticipants = this.ehrDomain.participantCount;
      if (this.ehrDomain.name.toLowerCase() === 'labs and measurements') {
        this.graphButtons = ['Values', 'Sex Assigned at Birth', 'Age', 'Sources'];
      } else {
        this.graphButtons = ['Sex Assigned at Birth', 'Age', 'Sources'];
      }
      this.initSearchSubscription = this.searchDomain(this.prevSearchText)
        .subscribe(results => this.searchCallback(results));
      // Add value changed event to search when value changes
      this.subscriptions.push(this.searchText.valueChanges
        .debounceTime(1500)
        .distinctUntilChanged()
        .switchMap((query) => this.searchDomain(query))
        .subscribe({
          next: results => this.searchCallback(results),
          error: err => {
            console.log('Error searching: ', err);
            this.loading = false;
            this.toggleTopConcepts();
          }
        }));
      this.subscriptions.push(this.searchText.valueChanges
        .subscribe((query) => {
          if (query == null) {
            query = '';
          }
          localStorage.setItem('searchText', query);
        }));
    }
  }

  private setDomain() {
    const obj = localStorage.getItem('ehrDomain');
    const searchText = localStorage.getItem('searchText');
    if (obj) {
      this.ehrDomain = JSON.parse(obj);
      this.subTitle = 'Keyword: ' + this.searchText;
      this.title = this.ehrDomain.name;
      this.domainSetup(this.ehrDomain);
    }
    if (!obj) {
      this.getThisDomain();
    }
  }

  // get the current ehr domain by its route
  public getThisDomain() {
    this.subscriptions.push(
      this.api.getDomainTotals(this.dbc.TO_SUPPRESS_PMS).subscribe(
        (data: DomainInfosAndSurveyModulesResponse) => {
          data.domainInfos.forEach(domain => {
            const thisDomain = Domain[domain.domain];
            if (thisDomain && thisDomain.toLowerCase() === this.domainId) {
              localStorage.setItem('ehrDomain', JSON.stringify(domain));
              this.setDomain();
            }
          });
        })
    );
  }

  public getNumberOfPages(query: string) {
    let domainResults = null;
    if (query && query != null) {
      this.subscriptions.push(this.api.getDomainSearchResults(query)
        .subscribe(results => {
          domainResults = results.domainInfos.filter(d => d.domain !== null);
          domainResults = domainResults.filter(
            d => d.name.toLowerCase() === this.ehrDomain.name.toLowerCase());
          if (domainResults && domainResults.length > 0) {
            this.totalResults = domainResults[0].standardConceptCount;
            this.numPages = Math.ceil(this.totalResults / 50);
          }
        }));
    } else {
      this.subscriptions.push(this.api.getDomainTotals()
        .subscribe(results => {
          domainResults = results.domainInfos.filter(d => d.domain !== null);
          domainResults = domainResults.filter(
            d => d.name.toLowerCase() === this.ehrDomain.name.toLowerCase());
          if (domainResults && domainResults.length > 0) {
            this.totalResults = domainResults[0].standardConceptCount;
            this.numPages = Math.ceil(this.totalResults / 50);
          }
        }));
    }
  }

  public searchCallback(results: any) {
    if (this.prevSearchText && this.prevSearchText.length >= 3 &&
      results && results.items && results.items.length > 0) {
      this.dbc.triggerEvent('domainPageSearch', 'Search',
        'Search Inside Domain ' + this.ehrDomain.name, null, this.prevSearchText, null);
    } else if (this.prevSearchText && this.prevSearchText.length >= 3 &&
      results && (!results.items || results.items.length <= 0)) {
      this.dbc.triggerEvent('domainPageSearch', 'Search (No Results)',
        'Search Inside Domain ' + this.ehrDomain.name, null, this.prevSearchText, null);
    }
    this.searchResult = results;
    this.searchResult.items = this.searchResult.items.filter(
      x => this.dbc.TO_SUPPRESS_PMS.indexOf(x.conceptId) === -1);
    this.items = this.searchResult.items;
    this.items = this.items.sort((a, b) => {
      if (a.countValue > b.countValue) {
        return -1;
      }
      if (a.countValue < b.countValue) {
        return 1;
      }
      return 0;
    }
    );
    for (const concept of this.items) {
      this.synonymString[concept.conceptId] = concept.conceptSynonyms.join(', ');
    }
    if (this.searchResult.standardConcepts) {
      this.standardConcepts = this.searchResult.standardConcepts;
      this.standardConceptIds = this.standardConcepts.map(a => a.conceptId);
    } else {
      this.standardConcepts = [];
    }
    // this.top10Results = this.searchResult.items.slice(0, 10);
    this.getTopTen(this.prevSearchText).subscribe((res) => {
      this.top10Results = res.items.slice(0, 10);
    });
    this.loading = false;
  }

  public getTopTen(query: string) {
    const maxResults = 10;
    const top10SearchRequest = {
      query: query,
      domain: this.ehrDomain.domain.toUpperCase(),
      standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
      maxResults: 10,
      minCount: 1,
      pageNumber: 0,
    };
    return this.api.searchConcepts(top10SearchRequest);
  }

  public searchDomain(query: string) {
    if (query != null && query !== ' ' && query) {
      this.router.navigate(
        ['ehr/' + this.dbc.domainToRoute[this.domainId].toLowerCase() + '/' + this.prevSearchText]
      );
    }
    this.getNumberOfPages(query);
    this.medlinePlusLink = 'https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=' +
      'medlineplus&v%3Asources=medlineplus-bundle&query='
      + query;
    // Unsubscribe from our initial search subscription if this is called again
    if (this.initSearchSubscription) {
      this.initSearchSubscription.unsubscribe();
    }
    const maxResults = 50;
    this.searchRequest = {
      query: query,
      domain: this.ehrDomain.domain.toUpperCase(),
      standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
      maxResults: maxResults,
      minCount: 1,
      pageNumber: this.currentPage - 1,
    };
    this.prevSearchText = query;
    return this.api.searchConcepts(this.searchRequest);
  }

  public toggleSources(row) {
    if (row.showSources) {
      row.showSources = false;
    } else {
      row.showSources = true;
      row.expanded = true;
      row.viewSynonyms = true;
    }
  }

  public selectGraph(g, r: any) {
    this.resetSelectedGraphs();
    this.graphToShow = g;
    this.dbc.triggerEvent('conceptClick', 'Concept Graph',
      'Click On ' + this.graphToShow + ' Chart',
      r.conceptName + ' - ' + r.domainId, this.prevSearchText, null);
    if (this.graphToShow === GraphType.Sources &&
      ((r.domainId === 'Condition' && r.vocabularyId === 'SNOMED')
        || (r.domainId === 'Procedure' && r.vocabularyId === 'SNOMED'))) {
      this.treeLoading = true;
      this.subscriptions.push(this.api.getCriteriaRolledCounts(r.conceptId)
        .subscribe({
          next: result => {
            this.treeData = [result.parent];
            this.treeLoading = false;
          }
        }));
    }
  }

  public toggleSynonyms(concept: any) {
    this.showMoreSynonyms[concept.conceptId] = !this.showMoreSynonyms[concept.conceptId];
    if (this.showMoreSynonyms[concept.conceptId]) {
      this.dbc.triggerEvent('conceptClick', 'Concept',
        'Click On See More Synonyms',
        concept.conceptName + ' - ' + concept.domainId, this.prevSearchText, null);
    }
  }

  public showToolTip(g) {
    if (g === 'Sex Assigned at Birth') {
      return this.tooltipText.biologicalSexChartHelpText + '\n' +
        this.tooltipText.ehrBSPercentageChartHelpText + '\n' +
        this.tooltipText.ehrBSCountChartHelpText + '\n';
    }
    if (g === 'Gender Identity') {
      return this.tooltipText.genderIdentityChartHelpText;
    }
    if (g === 'Race / Ethnicity') {
      return this.tooltipText.raceEthnicityChartHelpText;
    }
    if (g === 'Age') {
      return this.tooltipText.ehrAgeChartHelpText;
    }
    if (g === 'Sources') {
      return this.tooltipText.sourcesChartHelpText;
    }
    if (g === 'Values') {
      return this.tooltipText.valueChartHelpText;
    }
  }

  public toolTipPos(g) {
    if (g === 'Biological Sex' || g === 'Values') {
      return 'bottom-right';
    }
    return 'bottom-left';
  }

  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
  }

  public expandRow(concept: any) {
    // analytics
    this.dbc.triggerEvent('conceptClick', 'Concept', 'Click',
      concept.conceptName + ' - ' + concept.domainId, this.prevSearchText, null);
    if ( this.selectedConcept && concept.conceptCode === this.selectedConcept.conceptCode) {
      this.selectedConcept = undefined;
    } else {
      this.selectedConcept = concept;
    }
    this.resetSelectedGraphs();
    if (this.ehrDomain.name.toLowerCase() === 'labs and measurements') {
      this.graphToShow = GraphType.Values;
    } else {
      this.graphToShow = GraphType.BiologicalSex;
    }
  }

  public toggleTopConcepts() {
    this.showTopConcepts = !this.showTopConcepts;
  }

  public checkCount(count: number) {
    if (count <= 20) {
      return true;
    } else {
      return false;
    }
  }

  public participantPercentage(count: number) {
    if (!count || count <= 0) { return 0; }
    let percent: number = count / this.totalParticipants;
    percent = parseFloat(percent.toFixed(4));
    return percent * 100;
  }

  public changeResults(e) {
    this.loadPage();
  }

  public getTerm() {
    if (this.searchResult.matchType === MatchType.ID ||
      this.searchResult.matchType === MatchType.CODE) {
      return this.searchResult.matchedConceptName;
    }
    return this.searchText.value;
  }

  public getTopResultsSize() {
    if (this.top10Results.length < 10 && this.top10Results.length > 1) {
      return this.top10Results.length + ' ' + this.title;
    } else if (this.top10Results.length === 1) {
      return this.top10Results.length + ' ' + this.title.slice(0, -1);
    }
    return 10;
  }

  public getNextPage(event) {
    this.searchRequest.pageNumber = this.currentPage;
    window.scrollTo(0, 0);
    this.ngOnInit();
  }

  public conceptSelectedFromChart(concept: Concept) {
    if (concept === this.selectedConcept) {
      this.selectedConcept = undefined;
    } else {
      this.selectedConcept = concept;
      setTimeout(() => {
        // need to prefix a abc character b/c
        const elm = this.elm.nativeElement.querySelector('#c' + this.selectedConcept.conceptCode);
        console.log(elm, 'elm HERE');
        elm.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

}
