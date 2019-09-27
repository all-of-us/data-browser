import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
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
export class DbTableComponent implements OnChanges {
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
  @Input() totalResults: number;
  @Input() currentPage: number;
  @Input() totalParticipants: number;
  @Input() standardConceptIds: number[];
  @Input() graphButtons: any[];
  @Input() graphToShow: any;
  @Input() treeData: any[];
  @Input() treeLoading: boolean;
  @Input() graphType: any;
  expanded: boolean = false;
  private subscriptions: ISubscription[] = [];

  constructor(
    public tooltipText: TooltipService,
    public dbc: DbConfigService,
    private elm: ElementRef,
    private api: DataBrowserService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedConcept && changes.selectedConcept.currentValue) {
      this.expandRow(this.selectedConcept, true);
    }
  }

  public getTerm() {
    if (this.searchResult.matchType === MatchType.ID ||
      this.searchResult.matchType === MatchType.CODE) {
      return this.searchResult.matchedConceptName;
    }
    return this.searchText.value;
  }
  public checkIfExpanded(concept: Concept, event: any, sources?: boolean) {
    const classList = event.target.classList;
    for (let i = 0; i < classList.length; i++) {
      const item = classList[i];
      if (item === 'is-solid' || item === 'source-btn_active') {
        this.expanded = false;
        for (const s of this.subscriptions) {
          s.unsubscribe();
        }
      } else {
        this.expanded = true;
      }
    }

    if (this.selectedConcept && this.selectedConcept.conceptCode === concept.conceptCode) {
      // if already expanded than just change the graph
      if (sources) {
        this.graphToShow = GraphType.Sources;
      } else {
        this.graphToShow = GraphType.BiologicalSex;
      }
    } else if (sources) { // if not expand the row
      this.graphToShow = GraphType.Sources;
      this.loadSourceTree(concept);
      this.expandRow(concept);
    } else {
      this.graphToShow = GraphType.BiologicalSex;
      this.expandRow(concept);
    }
  }

  public expandRow(concept: any, fromChart?: boolean) {
    this.expanded = true;
    // analytics
    this.dbc.triggerEvent('conceptClick', 'Concept', 'Click',
      concept.conceptName + ' - ' + concept.domainId, this.prevSearchText, null);
    if (this.expanded && this.selectedConcept &&
      concept.conceptCode === this.selectedConcept.conceptCode) {
      if (fromChart && localStorage.getItem('selectedConceptCode')) {
        this.selectedConcept = concept;
        setTimeout(() => { // wait till previous selected row shrinks
          this.scrollTo('#c' + localStorage.getItem('selectedConceptCode'));
        }, 1);
      } else {
        this.selectedConcept = null;
        this.expanded = false;
      }
    } else {
      this.selectedConcept = concept;
      setTimeout(() => { // wait till previous selected row shrinks
        this.scrollTo('#c' + this.selectedConcept.conceptCode);
      }, 1);
    }
    if (this.ehrDomain.name.toLowerCase() === 'labs and measurements') {
      this.graphToShow = GraphType.Values;
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

  public selectGraph(g: string, r: any) {
    this.resetSelectedGraphs();
    this.graphToShow = g;
    this.dbc.triggerEvent('conceptClick', 'Concept Graph',
      'Click On ' + this.graphToShow + ' Chart',
      r.conceptName + ' - ' + r.domainId, this.prevSearchText, null);
    if (this.graphToShow === GraphType.Sources &&
      ((r.domainId === 'Condition' && r.vocabularyId === 'SNOMED')
        || (r.domainId === 'Procedure' && r.vocabularyId === 'SNOMED'))) {
      this.loadSourceTree(r);
    }
  }

  private loadSourceTree(concept: Concept) {
    this.treeLoading = true;
    // close previous subscription
    if (this.subscriptions.length > 0) {
      for (const s of this.subscriptions) {
        s.unsubscribe();
      }
    }
    if (localStorage.getItem(concept.conceptCode) === null) {
      this.subscriptions.push(this.api.getCriteriaRolledCounts(concept.conceptId)
        .subscribe({
          next: result => {
            this.treeData = [result.parent];
            this.treeLoading = false;
          }
        }));
    } else {
      // get stashed built tree from recursive tree component
      this.treeData = [JSON.parse(localStorage.getItem(concept.conceptCode))];
      this.treeLoading = false;
    }
  }
  buildTree(event: any) {
    if (this.treeData) {
      console.log(event, 'tree limb');

    }
  }

  public toolTipPos(g: string) {
    if (g === 'Biological Sex' || g === 'Values') {
      return 'bottom-right';
    }
    return 'bottom-left';
  }

  public showToolTip(g: string) {
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

}
