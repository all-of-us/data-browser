import { Component, ElementRef, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class EhrViewComponent implements OnChanges, OnInit, OnDestroy {
  domainId: string;
  title: string;
  subTitle: string;
  ehrDomain: any;
  searchText: FormControl = new FormControl();
  prevSearchText = '';
  searchResult: ConceptListResponse;
  items: any[] = [];
  fullResultItemsList: any[] = [];
  standardConcepts: any[] = [];
  graphButtons: any = [];
  loading: boolean;
  totalParticipants: number;
  top10Results: any[] = []; // We graph top10 results
  searchRequest: SearchConceptsRequest;
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
  testFilter = 0;
  orderFilter = 0;
  selectedFilterGrid = false;
  isChecked1 = true;
  isChecked2 = true;
  expandConcept = false;
  measurementTestsChecked: FormControl = new FormControl(localStorage.getItem('measurementTestsChecked') ?
    localStorage.getItem('measurementTestsChecked') : true);
  measurementOrdersChecked: FormControl = new FormControl(localStorage.getItem('measurementOrdersChecked') ?
    localStorage.getItem('measurementOrdersChecked') : true);
  standardConceptIds: number[];

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
    });
    this.route.queryParams.subscribe(params => {
      if (params['fromDifferentDomain'] && params['fromDifferentDomain'] === "true") {
        this.currentPage = 1;
      }
      if (params['search']) {
        this.searchFromUrl = params.search;
        this.prevSearchText = params.search;
        this.searchText.setValue(this.prevSearchText);
      } else {
        this.router.navigate(
          ['ehr/' + this.dbc.domainToRoute[this.domainId].toLowerCase()],
          {
            replaceUrl: true
          }
        );
      }
    });
    this.measurementTestsChecked.valueChanges.subscribe(value => {
      let getTests = 0;
      let getOrders = 0;
      if (value) {
        getTests = 1;
      } else {
        getTests = 0;
      }
      if (this.measurementOrdersChecked.value) {
        getOrders = 1;
      } else {
        getOrders = 0;
      }
      const measurementSearchRequestWithFilter =
        this.makeMeasurementSearchRequest(getTests, getOrders);
        this.api.searchConcepts(measurementSearchRequestWithFilter).subscribe(
        results =>
        {
          this.processSearchResults(results);
        });
      if (this.searchRequest.query && this.searchRequest.query !== null) {
        this.getMeasurementSearchResultTotals(getTests, getOrders);
      } else {
        this.getMeasurementDomainTotals(getTests, getOrders);
      }
    });
    this.measurementOrdersChecked.valueChanges.subscribe(value => {
      let getTests = 0;
      let getOrders = 0;
      if (value) {
        getOrders = 1;
      } else {
        getOrders = 0;
      }
      if (this.measurementTestsChecked.value) {
        getTests = 1;
      } else {
        getTests = 0;
      }
      const measurementSearchRequestWithFilter =
        this.makeMeasurementSearchRequest(getTests, getOrders);
        this.api.searchConcepts(measurementSearchRequestWithFilter).subscribe(
        results => {
          this.processSearchResults(results);
        });
      if (this.searchRequest.query && this.searchRequest.query !== null) {
        this.getMeasurementSearchResultTotals(getTests, getOrders);
      } else {
        this.getMeasurementDomainTotals(getTests, getOrders);
      }
    });
    this.loadPage();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedConcept && changes.selectedConcept.currentValue) {
      this.standardConceptIds = this.standardConcepts.map(c => c.conceptId);
      if (changes.selectedConcept && changes.selectedConcept.currentValue) {
        this.expandRow(this.selectedConcept, true);
      }
    }
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
    localStorage.removeItem('measurementTestsChecked');
    localStorage.removeItem('measurementOrdersChecked');
  }

  @HostListener('window:popstate', ['$event'])
  public onPopState(event: any) {
    if (this.searchText.value) {
      localStorage.setItem('searchTermBeforeBack', this.searchText.value);
    } else {
      localStorage.setItem('searchTermBeforeBack', '');
    }
    this.searchText.setValue(null);
  }

  public loadPage() {
    if (localStorage.getItem('measurementTestsChecked') === null) {
      localStorage.setItem('measurementTestsChecked', 'true');
    }
    if (localStorage.getItem('measurementOrdersChecked') === null) {
      localStorage.setItem('measurementOrdersChecked', 'true');
    }
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
    if (this.currentPage !== 1) {
      this.showTopConcepts = false;
    } else { this.showTopConcepts = true; }
    return true;
  }

  private domainSetup(domain) {
    if (domain) {
      // Set the graphs we want to show for this domain
      // Run search initially to filter to domain,
      // a empty search returns top ordered by count_value desc
      // Note, we save this in its own subscription so we can unsubscribe when they start typing
      // and these results don't trump the search results in case they come back slower
      this.totalParticipants = this.ehrDomain.participantCount;
      this.initSearchSubscription = this.searchDomain(this.prevSearchText)
        .subscribe(results => {
          this.searchCallback(results);
          if (this.expandConcept && this.selectedConcept) {
            this.expandRow(this.selectedConcept, true);
          }
        });
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
      this.totalResults = this.ehrDomain.standardConceptCount;
      this.domainSetup(this.ehrDomain);
    }
    if (!obj) {
      this.getThisDomain();
    }
  }

  // get the current ehr domain by its route
  public getThisDomain() {
    this.subscriptions.push(
      this.api.getDomainTotals(this.testFilter, this.orderFilter).subscribe(
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
      this.subscriptions.push(this.api.getDomainSearchResults(query, this.testFilter, this.orderFilter)
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
      this.subscriptions.push(this.api.getDomainTotals(this.testFilter, this.orderFilter)
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
    if (this.searchText.value) {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: { search: this.prevSearchText }
        });
    } else {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          replaceUrl: true
        });
    }
    if (this.prevSearchText && this.prevSearchText.length >= 3 &&
      results && results.items && results.items.length > 0) {
      this.dbc.triggerEvent('domainPageSearch', 'Search',
        'Search Inside Domain ' + this.ehrDomain.name, null, this.prevSearchText, null);
    } else if (this.prevSearchText && this.prevSearchText.length >= 3 &&
      results && (!results.items || results.items.length <= 0)) {
      this.searchRequest.pageNumber = 0;
      this.api.searchConcepts(this.searchRequest).subscribe((res) => {
        if(res.items && res.items.length > 0) {
          this.processSearchResults(res);
        } else {
          this.dbc.triggerEvent('domainPageSearch', 'Search (No Results)',
            'Search Inside Domain ' + this.ehrDomain.name, null, this.prevSearchText, null);
        }
      });
    }
    this.processSearchResults(results);
  }

  public processSearchResults(results) {
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
    for (var concept of this.standardConcepts.concat(this.items)) {
      this.synonymString[concept.conceptId] = concept.conceptSynonyms.join(', ');
      if (this.ehrDomain.domainConceptId === 21) {
        if (concept.measurementConceptInfo && concept.measurementConceptInfo.hasValues === 0) {
          concept.graphButtons = ['Sex Assigned at Birth', 'Age', 'Sources'];
        } else {
          concept.graphButtons = ['Values', 'Sex Assigned at Birth', 'Age', 'Sources'];
        }
      } else {
        concept.graphButtons = ['Sex Assigned at Birth', 'Age', 'Sources'];
      }
    }
    if (this.searchResult.standardConcepts) {
      this.standardConcepts = this.searchResult.standardConcepts;
      this.standardConceptIds = this.standardConcepts.map(a => a.conceptId);
    } else {
      this.standardConcepts = [];
    }
    if (this.currentPage === 1) {
      this.top10Results = this.searchResult.items.slice(0, 10);
    }
    /*
    this.getTopTen(this.prevSearchText).subscribe((res) => {
      console.log(res.items.slice(0,10));
      this.top10Results = res.items.slice(0, 10);
    });
    */
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
        ['ehr/' + this.dbc.domainToRoute[this.domainId].toLowerCase()],
        {
          queryParams: {search: this.searchFromUrl}
        }
      );
    }
    if (this.ehrDomain.domain.toLowerCase() === 'measurement') {
      if (localStorage.getItem('measurementTestsChecked') === null) {
        this.testFilter = 1;
      } else {
        this.testFilter = localStorage.getItem('measurementTestsChecked') === 'true' ? 1 : 0;
      }
      if (localStorage.getItem('measurementOrdersChecked') === null) {
        this.orderFilter = 1;
      } else {
        this.orderFilter = localStorage.getItem('measurementOrdersChecked') === 'true' ? 1 : 0;
      }
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
    if (this.ehrDomain.domain.toLowerCase() === 'measurement') {
      this.searchRequest = {
        query: query,
        domain: this.ehrDomain.domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
        maxResults: maxResults,
        minCount: 1,
        pageNumber: this.currentPage - 1,
        measurementTests: this.testFilter,
        measurementOrders: this.orderFilter
      };
    } else {
      this.searchRequest = {
        query: query,
        domain: this.ehrDomain.domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
        maxResults: maxResults,
        minCount: 1,
        pageNumber: this.currentPage - 1,
      };
    }
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

  public toggleSynonyms(concept: any) {
    this.showMoreSynonyms[concept.conceptId] = !this.showMoreSynonyms[concept.conceptId];
    if (this.showMoreSynonyms[concept.conceptId]) {
      this.dbc.triggerEvent('conceptClick', 'Concept',
        'Click On See More Synonyms',
        concept.conceptName + ' - ' + concept.domainId, this.prevSearchText, null);
    }
  }

  public toggleTopConcepts() {
    this.showTopConcepts = !this.showTopConcepts;
  }

  public changeResults(e) {
    this.selectedConcept = undefined;
    this.expandConcept = false;
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
    this.selectedConcept = undefined;
    this.searchRequest.pageNumber = this.currentPage;
    window.scrollTo(0, 0);
    this.loadPage();
  }

  public selectConcept(concept: Concept, fromChart?: boolean) {
    this.selectedConcept = concept;
    localStorage.setItem('selectedConceptCode', this.selectedConcept.conceptCode);
    if (fromChart && this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadPage();
      this.expandConcept = true;
    } else {
      this.expandRow(this.selectedConcept, true);
    }
  }
  
  public expandRow(concept: any, fromChart?: boolean) {
    // analytics
    this.dbc.triggerEvent('conceptClick', 'Concept', 'Click',
      concept.conceptName + ' - ' + concept.domainId, this.prevSearchText, null);
    if (this.selectedConcept && concept.conceptCode === this.selectedConcept.conceptCode) {
      if (fromChart && localStorage.getItem('selectedConceptCode'))  {
        this.selectedConcept = concept;
        setTimeout(() => { // wait till previous selected row shrinks
          this.scrollTo('#c' + localStorage.getItem('selectedConceptCode'));
        }, 50);
      } else {
        this.selectedConcept = null;
      }
    } else {
      this.selectedConcept = concept;
      setTimeout(() => { // wait till previous selected row shrinks
        this.scrollTo('#c' + this.selectedConcept.conceptCode);
      }, 1);
    }
    this.resetSelectedGraphs();
    if (this.ehrDomain.name.toLowerCase() === 'labs and measurements') {
      if (this.measurementTestsChecked.value === true) {
        this.graphToShow = GraphType.Values;
      } else {
        this.graphToShow = GraphType.BiologicalSex;
      }
    } else {
      this.graphToShow = GraphType.BiologicalSex;
    }
  }
  
  public scrollTo(id: string) {
    const el = this.elm.nativeElement.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
  }
  
  public participantPercentage(count: number) {
    if (!count || count <= 0) { return 0; }
    let percent: number = count / this.totalParticipants;
    percent = parseFloat(percent.toFixed(4));
    return percent * 100;
  }
  
  public checkCount(count: number) {
    if (count <= 20) {
      return true;
    } else {
      return false;
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
  
  public toolTipPos(g) {
    if (g === 'Biological Sex' || g === 'Values') {
      return 'bottom-right';
    }
    return 'bottom-left';
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
      return this.tooltipText.ehrAgeChartHelpText + '\n' +
        this.tooltipText.ehrAgePercentageChartHelpText + '\n' +
        this.tooltipText.ehrAgeCountChartHelpText + '\n';
    }
    if (g === 'Sources') {
      return this.tooltipText.sourcesChartHelpText;
    }
    if (g === 'Values') {
      return this.tooltipText.valueChartHelpText;
    }
  }
  public hoverOnTooltip(label: string, searchTerm: string, action: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      label, this.searchText.value, action);
  }
  
  public filterMeasurementDataTypes() {
    if (this.selectedFilterGrid) {
      this.selectedFilterGrid = false;
    } else {
      this.selectedFilterGrid = true;
    }
  }
  
  public checkBoxClick(box: string, value: boolean) {
    if (box === 'tests') {
      if (value) {
        this.measurementTestsChecked.setValue(true);
        localStorage.setItem('measurementTestsChecked', 'true');
      } else {
        this.measurementTestsChecked.setValue(false);
        localStorage.setItem('measurementTestsChecked', 'false');
      }
    }
    if (box === 'orders') {
      if (value) {
        this.measurementOrdersChecked.setValue(true);
        localStorage.setItem('measurementOrdersChecked', 'true');
      } else {
        this.measurementOrdersChecked.setValue(false);
        localStorage.setItem('measurementOrdersChecked', 'false');
      }
    }
  }
  
  public checkMeasurementTests() {
    if (this.currentPage > 1) {
      return localStorage.getItem('measurementTestsChecked') === 'true';
    }
    return this.measurementTestsChecked.value;
  }
  
  public checkMeasurementOrders() {
    if (this.currentPage > 1) {
      return localStorage.getItem('measurementOrdersChecked') === 'true';
    }
    return this.measurementOrdersChecked.value;
  }
  
  public getMeasurementDomainTotals(testFilter: number, orderFilter: number) {
    this.api.getDomainTotals(testFilter, orderFilter).subscribe(
      results => {
        const domainResults = results.domainInfos.filter(d => d.domainConceptId === 21);
        this.totalResults = domainResults[0].standardConceptCount;
      }
    );
  }
  
  public getMeasurementSearchResultTotals(testFilter: number, orderFilter: number) {
    this.api.getDomainSearchResults(this.searchRequest.query, testFilter, orderFilter)
      .subscribe(
        results => {
          const domainResults = results.domainInfos.filter(d => d.domainConceptId === 21);
          this.totalResults = domainResults[0].standardConceptCount;
        }
      );
  }
  
  public makeMeasurementSearchRequest(testFilter: number, orderFilter: number) {
    const measurementSearchRequestWithFilter = {
      query: this.searchRequest.query,
      domain: this.searchRequest.domain,
      standardConceptFilter: this.searchRequest.standardConceptFilter,
      maxResults: this.searchRequest.maxResults,
      minCount: this.searchRequest.minCount,
      pageNumber: this.searchRequest.pageNumber,
      measurementTests: testFilter,
      measurementOrders: orderFilter
    };
    return measurementSearchRequestWithFilter;
  }
}
