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

  // Todo put constants in a class for use in other views
  chartType = 'bar';

  // Total analyses
  genderAnalysis: Analysis = null;
  raceAnalysis: Analysis = null;
  ethnicityAnalysis: Analysis = null;

  // Get the physical measurement groups array we display here
  conceptGroups: ConceptGroup[];
  // Initialize to first group and concept, adjust order in groups array above
  selectedGroup: ConceptGroup;
  selectedConcept: ConceptWithAnalysis;
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
    this.subscriptions.push(this.api.getRaceAnalysis()
      .subscribe({
          next: result => {
            this.raceAnalysis = result;
            this.loadingStack.pop();
          },
          error: err =>  {
            this.loadingStack.pop();
            console.log('Error: ', err);
          }
      }));

    this.loadingStack.push(true);
    this.subscriptions.push(this.api.getEthnicityAnalysis()
      .subscribe({
        next: result => {
          this.ethnicityAnalysis = result;
          this.loadingStack.pop();
        },
        error: err =>  {
          this.loadingStack.pop();
          console.log('Error: ', err);
        }
      }));
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  showMeasurement(group: any, concept: any) {
    this.selectedGroup = group;
    this.selectedConcept = concept;
    this.dbc.triggerEvent('conceptClick', 'Physical Measurement', 'Click',
      concept.conceptName + ' - ' + 'Physical Measurements', this.searchText, null);
  }
  
  public hoverOnTooltip(label: string, action: string) {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      label, null, action);
  }
}
