import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import {DataBrowserService} from '../../../../publicGenerated/api/dataBrowser.service';
import {Analysis} from '../../../../publicGenerated/model/analysis';
import {ConceptGroup} from '../../../utils/conceptGroup';
import {ConceptWithAnalysis} from '../../../utils/conceptWithAnalysis';
import {DbConfigService} from '../../../utils/db-config.service';
import { DomainType } from '../../../utils/enum-defs';
import {TooltipService} from '../../../utils/tooltip.service';

@Component({
  selector: 'app-physical-measurements',
  templateUrl: './pm.component.html',
  styleUrls: ['../../../styles/template.css', '../../../styles/cards.css', './pm.component.css']
})
export class PhysicalMeasurementsComponent implements OnInit, OnDestroy {
  title = 'Browse Program Physical Measurements';
  pageImage = '/assets/db-images/man-standing.png';
  private subscriptions: ISubscription[] = [];
  loadingStack: any = [];
  ageChartTitle = 'Age When Physical Measurement Was Taken';
  bsChartTitle = 'Sex Assigned At Birth';
  domainCountAnalysis: any;

  // Todo put constants in a class for use in other views
  chartType = 'bar';

  // Total analyses
  genderAnalysis: Analysis = null;
  raceAnalysis: Analysis = null;
  ethnicityAnalysis: Analysis = null;

  selectedConceptUnit: string;

  unitNames = [];

  // Get the physical measurement groups array we display here
  conceptGroups: ConceptGroup[];
  // Initialize to first group and concept, adjust order in groups array above
  selectedGroup: ConceptGroup;
  selectedConcept: ConceptWithAnalysis;
  selectedConceptValueAnalysis: Analysis;
  domainType = DomainType.PHYSICAL_MEASUREMENTS;
  searchText: string = null;

  // we save the total gender counts
  femaleCount = 0;
  maleCount = 0;
  otherCount = 0;

  constructor(private api: DataBrowserService, public dbc: DbConfigService,
              private tooltipText: TooltipService) {

  }

  loading() {
    return this.loadingStack.length > 0;
  }

  ngOnInit() {
    this.searchText = localStorage.getItem('searchText');
    this.loadingStack.push(true);
    this.dbc.getPmGroups().subscribe(results => {
      this.conceptGroups = results;
      if (this.searchText) {
        this.selectedGroup = this.conceptGroups.filter(conceptgroup =>
          conceptgroup.groupName.toLowerCase().includes(this.searchText.toLowerCase()))[0];
      } else {
          this.selectedGroup = this.conceptGroups[0];
      }
      // wait 1ms before triggering the graphs.
      setTimeout(() =>  this.selectedConcept = this.selectedGroup.concepts[0], 1);
      this.loadingStack.pop();
    });

    // Get demographic totals
    this.loadingStack.push(true);
    this.subscriptions.push(this.api.getCountAnalysis('Physical Measurements', 'pm').subscribe(
      results => {
        this.domainCountAnalysis = results;
      }
    ));

    this.loadingStack.push(true);
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  showMeasurement(group: any, concept: any) {
    this.selectedGroup = group;
    this.selectedConcept = concept;
    this.unitNames = this.dbc.UNIT_ORDER[this.selectedConcept.conceptId];
    if (this.unitNames) {
        this.selectedConceptUnit = this.unitNames[0];
    }
    if (this.selectedConcept.analyses &&
    this.selectedConcept.analyses.measurementValueGenderAnalysis) {
        if (!this.selectedConceptUnit) {
            this.selectedConceptValueAnalysis =
            this.selectedConcept.analyses.measurementValueGenderAnalysis[0];
        } else {
            const temp = this.selectedConcept.analyses.measurementValueGenderAnalysis.filter(
            a => a.unitName.toLowerCase() === this.selectedConceptUnit.toLowerCase());
            this.selectedConceptValueAnalysis = temp[0];
        }
    }
    this.dbc.triggerEvent('conceptClick', 'Physical Measurement', 'Click',
      concept.conceptName + ' - ' + 'Physical Measurements', this.searchText, null);
  }

  setUnit(unit) {
    this.selectedConceptUnit = unit;
    const temp = this.selectedConcept.analyses.measurementValueGenderAnalysis.filter(
    a => a.unitName.toLowerCase() === this.selectedConceptUnit.toLowerCase());
    this.selectedConceptValueAnalysis = temp[0];
  }
  public hoverOnTooltip(label: string, action: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      label, null, action);
  }

  getValueAnalysis() {
    if (!this.selectedConceptValueAnalysis) {
        return this.selectedConcept.analyses.measurementValueGenderAnalysis[0];
    }
    return this.selectedConceptValueAnalysis;
  }
}
