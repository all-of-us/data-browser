import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BrowserInfoRx,
  ResponsiveSizeInfoRx, UserAgentInfoRx
} from 'ngx-responsive';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { ISubscription } from 'rxjs/Subscription';
import { DataBrowserService } from '../../../publicGenerated/api/dataBrowser.service';
import { Concept } from '../../../publicGenerated/model/concept';
import { ConceptListResponse } from '../../../publicGenerated/model/conceptListResponse';
import { SearchConceptsRequest } from '../../../publicGenerated/model/searchConceptsRequest';
import { StandardConceptFilter } from '../../../publicGenerated/model/standardConceptFilter';
import { DbConfigService } from '../../utils/db-config.service';
import { GraphType } from '../../utils/enum-defs';
import { TooltipService } from '../../utils/tooltip.service';

/* This displays concept search for a Domain. */

@Component({
  selector: 'app-ehr-view',
  templateUrl: './ehr-view.component.html',
  styleUrls: ['../../styles/template.css', '../../styles/cards.css', './ehr-view.component.css']
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
  graphButtons = [];
  graphType = GraphType;
  treeData: any[];
  expanded = true;
  childTest = [];
  treeLoading = false;

  @ViewChild('chartElement') chartEl: ElementRef;


  constructor(private route: ActivatedRoute,
    private router: Router,
    private api: DataBrowserService,
    private tooltipText: TooltipService,
    public dbc: DbConfigService,
  ) {
    this.route.params.subscribe(params => {
      this.domainId = params.id;
    });
    console.log(this.router.onSameUrlNavigation);
  }
  ngOnInit() {
    this.loadPage();
  }


  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
    this.initSearchSubscription.unsubscribe();
  }


  public loadPage() {
    this.items = [];

    // Get search text from localStorage
    this.prevSearchText = localStorage.getItem('searchText');
    this.searchText.setValue(this.prevSearchText);
    const obj = localStorage.getItem('ehrDomain');
    if (obj) {
      this.ehrDomain = JSON.parse(obj);
      this.subTitle = 'Keyword: ' + this.searchText;
      this.title = this.ehrDomain.name;
    } else {
      /* Error. We need a db Domain object. */
      this.title = 'Keyword: ' + this.searchText;
      this.title = 'Error - no result for domain selected';
    }
    if (this.ehrDomain) {
      // Set the graphs we want to show for this domain
      // Run search initially to filter to domain,
      // a empty search returns top ordered by count_value desc
      // Note, we save this in its own subscription so we can unsubscribe when they start typing
      // and these results don't trump the search results in case they come back slower
      this.totalParticipants = this.ehrDomain.participantCount;
      if (this.ehrDomain.name.toLowerCase() === 'measurements') {
        this.graphButtons = ['Values', 'Biological Sex',
          'Gender Identity', 'Race / Ethnicity', 'Age', 'Sources'];
      } else {
        this.graphButtons = ['Biological Sex', 'Gender Identity',
          'Race / Ethnicity', 'Age', 'Sources'];
      }
      this.initSearchSubscription = this.searchDomain(this.prevSearchText).subscribe(results =>
        this.searchCallback(results));

      // Add value changed event to search when value changes
      this.subscriptions.push(this.searchText.valueChanges
        .debounceTime(300)
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
      this.subscriptions.push(this.searchText.valueChanges.subscribe(
        (query) => localStorage.setItem('searchText', query)));
    }
    this.showTopConcepts = true;
  }

  public searchCallback(results: any) {
    this.searchResult = results;
    this.searchResult.items = this.searchResult.items.filter(
      x => this.dbc.TO_SUPPRESS_PMS.indexOf(x.conceptId) === -1);
    this.items = this.searchResult.items;
    for (const concept of this.items) {
      this.synonymString[concept.conceptId] = concept.conceptSynonyms.join(', ');
    }
    if (this.searchResult.standardConcepts) {
      this.standardConcepts = this.searchResult.standardConcepts;
    }
    this.top10Results = this.searchResult.items.slice(0, 10);
    // Set the localStorage to empty so making a new search here does not follow to other pages
    // localStorage.setItem('searchText', '');
    this.loading = false;
  }

  public searchDomain(query: string) {
    // Unsubscribe from our initial search subscription if this is called again
    this.medlinePlusLink = 'https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=' +
      'medlineplus&v%3Asources=medlineplus-bundle&query='
      + query;
    if (this.initSearchSubscription) {
      this.initSearchSubscription.unsubscribe();
    }
    const maxResults = 100;
    this.loading = true;

    this.searchRequest = {
      query: query,
      domain: this.ehrDomain.domain.toUpperCase(),
      standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
      maxResults: maxResults,
      minCount: 1
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
    this.chartEl.nativeElement.scrollIntoView(
      { behavior: 'smooth', block: 'nearest', inline: 'start' });
    this.resetSelectedGraphs();
    this.graphToShow = g;
    if (this.graphToShow === GraphType.Sources) {
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

  public toggleSynonyms(conceptId) {
    this.showMoreSynonyms[conceptId] = !this.showMoreSynonyms[conceptId];
  }

  public showToolTip(g) {
    if (g === 'Biological Sex') {
      return this.tooltipText.biologicalSexChartHelpText;
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
    if (g === 'Biological Sex') {
      return 'bottom-right';
    }
    return 'bottom-left';
  }

  public resetSelectedGraphs() {
    this.graphToShow = GraphType.None;
  }

  public expandRow(concepts: any[], r: any) {
    if (r.expanded) {
      r.expanded = false;
      return;
    }
    this.resetSelectedGraphs();
    this.graphToShow = GraphType.BiologicalSex;
    concepts.forEach(concept => concept.expanded = false);
    r.expanded = true;
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
}
