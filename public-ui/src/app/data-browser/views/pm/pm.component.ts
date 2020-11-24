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
  selectedConceptValueCountAnalysis: Analysis;
  domainType = DomainType.PHYSICAL_MEASUREMENTS;
  searchText: string = null;

  // we save the total gender counts
  femaleCount = 0;
  maleCount = 0;
  otherCount = 0;

  pmGroups: any;

  constructor(private api: DataBrowserService, public dbc: DbConfigService,
              private tooltipText: TooltipService) {

  }

  loading() {
    return this.loadingStack.length > 0;
  }

  ngOnInit() {
    this.searchText = localStorage.getItem('searchText');
    this.pmGroups = this.dbc.pmGroups;

    // Get demographic totals
    this.loadingStack.push(true);
    this.subscriptions.push(this.api.getConceptAnalysisResults(this.dbc.PM_CONCEPTS.map(String))
              .subscribe({
                next: result => {
                  const items = result.items;
                  this.conceptGroups = this.dbc.pmGroups;
                  for (const g of this.conceptGroups) {
                    for (const c of g.concepts) {
                        const matchedItem = items.filter(i => i.conceptId === c.conceptId);
                        c.analyses = matchedItem.length > 0 ? matchedItem[0] : null;
                        this.arrangeConceptAnalyses(c);
                    }
                  }
                  if (this.searchText) {
                    this.selectedGroup = this.conceptGroups.filter(conceptgroup =>
                            conceptgroup.groupName.toLowerCase().
                            includes(this.searchText.toLowerCase()))[0];
                  } else {
                            this.selectedGroup = this.conceptGroups[0];
                  }
                  this.showMeasurement(this.selectedGroup, this.selectedGroup.concepts[0]);
                  this.loadingStack.pop();
                },
                error: err =>  {
                  this.loadingStack.pop();
                  console.log('Error: ', err);
                }
        }));
    this.loadingStack.push(true);
    this.subscriptions.push(this.api.getCountAnalysis('Physical Measurements', 'pm')
          .subscribe({
            next: result => {
              this.domainCountAnalysis = result;
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
    if (this.selectedConcept && this.selectedConcept.analyses &&
    this.selectedConcept.analyses.measurementGenderCountAnalysis) {
        this.unitNames = [];
        for (const r of this.selectedConcept.analyses.measurementGenderCountAnalysis) {
              let tempUnitNames = r.results.map(({ stratum2 }) => stratum2);
              tempUnitNames = tempUnitNames.filter(
              function(elem, index, self) {
                return index === self.indexOf(elem);
              });
              this.unitNames.push(...tempUnitNames);
        }
    }
    if (this.unitNames) {
        this.selectedConceptUnit = this.unitNames[0];
        if (this.selectedConceptUnit) {
            this.setAnalysis();
        }
    }
    this.dbc.triggerEvent('conceptClick', 'Physical Measurement', 'Click',
      concept.conceptName + ' - ' + 'Physical Measurements', this.searchText, null);
  }

  setAnalysisStratum(results: any) {
    for (const r of results) {
        if (r.analysisStratumName === null) {
            r.analysisStratumName = this.dbc.GENDER_STRATUM_MAP[r.stratum3];
        }
    }
  }

  public getCountAnalysis(conceptUnit: any) {
    return this.selectedConcept.analyses.measurementGenderCountAnalysis.filter(r => r.unitName === this.selectedConceptUnit)[0].results;
  }

  arrangeConceptAnalyses(concept: any) {
      if (concept.analyses.genderAnalysis) {
        this.organizeGenders(concept);
      }

      var genders = [this.dbc.MALE_GENDER_ID, this.dbc.FEMALE_GENDER_ID, this.dbc.OTHER_GENDER_ID];
      let prevResult;
      for (let gca of concept.analyses.measurementGenderCountAnalysis) {
        if (gca.results.length < 3) {
            for (let result of gca.results) {
                prevResult = result;
                genders = genders.filter(item => item != result.stratum3);
            }
            for (let gender of genders) {
                const missingResult = { ...prevResult };
                missingResult.stratum3 = gender ;
                missingResult.countValue = 20;
                missingResult.sourceCountValue = 20;
                gca.results.push(missingResult);
            }
        }
        this.setAnalysisStratum(gca.results);
      }

  }

  organizeGenders(concept: ConceptWithAnalysis) {
      const analysis: Analysis = concept.analyses.genderAnalysis;
      let male = null;
      let female = null;
      let other = null;

      // No need to do anything if only one gender
      if (analysis.results.length <= 1) {
        return;
      }
      const results = [];
      for (const g of analysis.results) {
        if (g.stratum2 === this.dbc.MALE_GENDER_ID) {
          male = g;
        } else if (g.stratum2 === this.dbc.FEMALE_GENDER_ID) {
          female = g;
        } else if (g.stratum2 === this.dbc.OTHER_GENDER_ID) {
          other = g;
        }
      }

      // Order genders how we want to display  Male, Female , Others
      if (male) { results.push(male); }
      if (female) { results.push(female); }
      if (other) { results.push(other); }
      analysis.results = results;
  }

  setUnit(unit) {
      this.selectedConceptUnit = unit;
      this.setAnalysis();
  }

  setAnalysis() {
    if (['903120', '903111'].indexOf(this.selectedConcept.conceptId) === -1) {
            let temp = this.selectedConcept.analyses.measurementValueGenderAnalysis.filter(
                                a => a.unitName.toLowerCase() ===
                                this.selectedConceptUnit.toLowerCase());
            this.selectedConceptValueAnalysis = temp[0];
            temp = this.selectedConcept.analyses.measurementGenderCountAnalysis.filter(
                                        a => a.unitName.toLowerCase() ===
                                        this.selectedConceptUnit.toLowerCase());
            this.selectedConceptValueCountAnalysis = temp[0];
    }
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
