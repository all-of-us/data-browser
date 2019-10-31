import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DbConfigService } from 'app/utils/db-config.service';
import { Concept, ConceptListResponse, DataBrowserService, MatchType, SearchConceptsRequest } from 'publicGenerated';
import { ISubscription } from 'rxjs/Subscription';
import { GraphType } from '../../utils/enum-defs';
import { TooltipService } from '../../utils/tooltip.service';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'db-table',
  templateUrl: './db-table.component.html',
  styleUrls: ['../../styles/template.css', './db-table.component.css']
})
export class DbTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() items: any[];
  @Input() searchRequest: SearchConceptsRequest;
  @Input() searchResult: ConceptListResponse;
  @Input() selectedConcept: Concept;
  @Input() searchText: any;
  @Input() medlinePlusLink: string;
  @Input() prevSearchText: string;
  @Input() ehrDomain: any;
  @Input() synonymString: any;
  @Input() showMoreSynonyms: any;
  @Input() standardConcepts: any[];
  @Input() currentPage: number;
  @Input() totalParticipants: number;
  @Input() graphButtons: any[];
  @Input() graphToShow: any;
  @Input() treeData: any;
  @Input() treeLoading: boolean;
  @Input() graphType: any;
  @Input() totalResults: number;
  // Save this till labs is tested completely to see
  // if the pagination breaks because of not having this
  // totalResults = localStorage.getItem('totalResults') ?
  // +localStorage.getItem('totalResults') : 0;
  numPages: number;
  selectedFilterGrid = false;
  isChecked1 = localStorage.getItem('measurementTestsChecked') ?
    (localStorage.getItem('measurementTestsChecked') === 'true' ? true : false) : true;
  isChecked2 = localStorage.getItem('measurementOrdersChecked') ?
    (localStorage.getItem('measurementOrdersChecked') === 'true' ? true : false) : true;
  measurementTestsChecked: FormControl = new FormControl(localStorage.getItem('measurementTestsChecked') ?
    (localStorage.getItem('measurementTestsChecked') === 'true' ? true : false) : true);
  measurementOrdersChecked: FormControl = new FormControl(localStorage.getItem('measurementOrdersChecked') ?
    (localStorage.getItem('measurementOrdersChecked') === 'true' ? true : false) : true);
  standardConceptIds: number[];
  private subscriptions: ISubscription[] = [];
  private initSubscription: ISubscription = null;

  constructor(
    public tooltipText: TooltipService,
    public dbc: DbConfigService,
    private elm: ElementRef,
    private api: DataBrowserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.domainCounts();
    this.subscriptions.push(this.measurementTestsChecked.valueChanges
      .subscribe((query) => {
        let getTests = 0;
        let getOrders = 0;
        if (query) {
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
            this.items = results.items);
        if (this.searchRequest.query && this.searchRequest.query !== null) {
          this.getMeasurementSearchResultTotals(getTests, getOrders);
        } else {
          this.getMeasurementDomainTotals(getTests, getOrders);
        }
      }));
    this.subscriptions.push(this.measurementOrdersChecked.valueChanges
      .subscribe((query) => {
        let getTests = 0;
        let getOrders = 0;
        if (query) {
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
          results =>
            this.items = results.items);
        if (this.searchRequest.query && this.searchRequest.query !== null) {
          this.getMeasurementSearchResultTotals(getTests, getOrders);
        } else {
          this.getMeasurementDomainTotals(getTests, getOrders);
        }
      }));
  }

  public domainCounts() {
    let domainResults = null;
    const testFilter = localStorage.getItem('measurementTestsChecked') ?
      (localStorage.getItem('measurementTestsChecked') === 'true' ? 1 : 0) : 1;
    const orderFilter = localStorage.getItem('measurementOrdersChecked') ?
      (localStorage.getItem('measurementOrdersChecked') === 'true' ? 1 : 0) : 1;
    if (this.searchText.value && this.searchText.value != null) {
      this.initSubscription = this.api.getDomainSearchResults
        (this.searchText.value, testFilter, orderFilter)
        .subscribe(results => {
          domainResults = results.domainInfos.filter(d => d.domain !== null);
          domainResults = domainResults.filter(
            d => d.name.toLowerCase() === this.ehrDomain.name.toLowerCase());
          if (domainResults && domainResults.length > 0) {
            this.totalResults = domainResults[0].standardConceptCount;
            this.numPages = Math.ceil(this.totalResults / 50);
          }
        });
    } else {
      this.initSubscription = this.api.getDomainTotals(testFilter, orderFilter)
        .subscribe(results => {
          domainResults = results.domainInfos.filter(d => d.domain !== null);
          domainResults = domainResults.filter(
            d => d.name.toLowerCase() === this.ehrDomain.name.toLowerCase());
          if (domainResults && domainResults.length > 0) {
            this.totalResults = domainResults[0].standardConceptCount;
            this.numPages = Math.ceil(this.totalResults / 50);
          }
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedConcept && changes.selectedConcept.currentValue) {
      this.standardConceptIds = this.standardConcepts.map(c => c.conceptId);
      if (changes.selectedConcept && changes.selectedConcept.currentValue) {
        this.expandRow(this.selectedConcept, true);
      }
    }
  }

  public getTerm() {
    if (this.searchResult.matchType === MatchType.ID ||
      this.searchResult.matchType === MatchType.CODE) {
      return this.searchResult.matchedConceptName;
    }
    return this.searchText.value;
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
      if (concept.measurementConceptInfo !== null &&
        concept.measurementConceptInfo.hasValues === 1) {
        this.graphToShow = GraphType.Values;
      } else if (concept.measurementConceptInfo !== null &&
        concept.measurementConceptInfo.hasValues === 0) {
        this.graphToShow = GraphType.BiologicalSex;
      }
    } else {
      this.graphToShow = GraphType.BiologicalSex;
    }
  }

  public scrollTo(id: string) {
    const el = this.elm.nativeElement.querySelector(id);
    el.scrollIntoView({ behavior: 'smooth' });
  }

  public checkCount(count: number) {
    if (count <= 20) {
      return true;
    } else {
      return false;
    }
  }

  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
  }
  public toggleSynonyms(concept: any) {
    this.showMoreSynonyms[concept.conceptId] = !this.showMoreSynonyms[concept.conceptId];
    if (this.showMoreSynonyms[concept.conceptId]) {
      this.dbc.triggerEvent('conceptClick', 'Concept',
        'Click On See More Synonyms',
        concept.conceptName + ' - ' + concept.domainId, this.prevSearchText, null);
    }
  }

  public participantPercentage(count: number) {
    if (!count || count <= 0) { return 0; }
    let percent: number = count / this.totalParticipants;
    percent = parseFloat(percent.toFixed(4));
    return percent * 100;
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
      this.subscriptions.push(this.api.getCriteriaRolledCounts(r.conceptId,
        this.ehrDomain.domain.toLowerCase())
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
        this.graphButtons = ['Sex Assigned at Birth', 'Age', 'Sources'];
        localStorage.setItem('measurementTestsChecked', 'false');
      }
      localStorage.setItem('measurementOrdersChecked',
        this.measurementOrdersChecked.value === true ? 'true' : 'false');
    }
    if (box === 'orders') {
      if (value) {
        this.measurementOrdersChecked.setValue(true);
        localStorage.setItem('measurementOrdersChecked', 'true');
      } else {
        this.measurementOrdersChecked.setValue(false);
        localStorage.setItem('measurementOrdersChecked', 'false');
      }
      localStorage.setItem('measurementTestsChecked',
        this.measurementTestsChecked.value === true ? 'true' : 'false');
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

  public getGraphButtons(r: any) {
    if (r.domainId.toLowerCase() === 'measurement') {
      if (r.measurementConceptInfo !== null && r.measurementConceptInfo.hasValues === 1) {
        return ['Values', 'Sex Assigned at Birth', 'Age', 'Sources'];
      } else if (r.measurementConceptInfo !== null && r.measurementConceptInfo.hasValues === 0) {
        return ['Sex Assigned at Birth', 'Age', 'Sources'];
      }
    }
    return this.graphButtons;
  }

  public ngOnDestroy() {
    if (localStorage.getItem('measurementTestsChecked') === null) {
      localStorage.setItem('measurementTestsChecked', 'true');
    }
    if (localStorage.getItem('measurementOrdersChecked') === null) {
      localStorage.setItem('measurementOrdersChecked', 'true');
    }
    localStorage.setItem('totalResults', String(this.totalResults));
    if (this.subscriptions) {
      for (const s of this.subscriptions) {
        s.unsubscribe();
      }
    }
    if (this.initSubscription) {
      this.initSubscription.unsubscribe();
    }
  }
}
