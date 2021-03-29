import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription as ISubscription } from 'rxjs/internal/Subscription';
import { environment } from 'environments/environment';
import { DataBrowserService } from 'publicGenerated/api/dataBrowser.service';
import { AchillesResult } from 'publicGenerated/model/achillesResult';
import { Analysis } from 'publicGenerated/model/analysis';
import { Concept } from 'publicGenerated/model/concept';
import { ConceptAnalysis } from 'publicGenerated/model/conceptAnalysis';
import { DbConfigService } from 'app/utils/db-config.service';
import { GraphType } from 'app/utils/enum-defs';

@Component({
  selector: 'app-concept-charts',
  templateUrl: './concept-charts.component.html',
  styleUrls: ['./concept-charts.component.css', '../../styles/page.css']
})
export class ConceptChartsComponent implements OnChanges, OnDestroy {
  @Input() concept: Concept;
  @Input() backgroundColor = 'transparent'; // background color to pass to the chart component
  @Input() showGraph = GraphType.None;
  // @Input() showRace = false;
  // @Input() showEthnicity = false;
  @Input() searchTerm = '';

  private subscriptions: ISubscription[] = [];
  loadingStack: any = [];
  results: Array<any>;
  maleGenderResult: AchillesResult;
  femaleGenderResult: AchillesResult;
  intersexGenderResult: AchillesResult;
  noneGenderResult: AchillesResult;
  otherGenderResult: AchillesResult;
  maleGenderChartTitle = '';
  femaleGenderChartTitle = '';
  intersexGenderChartTitle = '';
  noneGenderChartTitle = '';
  otherGenderChartTitle = '';
  sourceConcepts: Concept[] = null;
  analyses: ConceptAnalysis;
  unitNames: string[] = [];
  selectedUnit: string;
  genderResults: AchillesResult[] = [];
  displayMeasurementGraphs = false;
  toDisplayMeasurementGenderAnalysis: any;
  displayGraphErrorMessage = false;
  toDisplayMeasurementGenderCountAnalysis: Analysis;
  graphType = GraphType;
  subUnitValuesFilter = ['No Unit (Text)', 'No Unit (Numeric)'];
  mixtureOfValues = false;
  selectedSubGraph: string;
  selectedMeasurementType: string;
  toDisplayGenderAnalysis: Analysis;
  toDisplayAgeAnalysis: Analysis;
  domainCountAnalysis: any;
  conceptName: string;
  testReact: boolean;
  reactChart: boolean;

  constructor(private api: DataBrowserService, public dbc: DbConfigService) {
    this.testReact = environment.testReact;
    this.reactChart = environment.reactChart;
  }

  loading() {
    return this.loadingStack.length > 0;
  }

  public fetchMeasurementGenderResults() {
    if (!this.analyses) {
      return;
    }
    if (this.showGraph === GraphType.Values && this.analyses.genderAnalysis) {
      this.genderResults = this.analyses.genderAnalysis.results;
    }
    this.unitNames = [];
    let unitCounts = [];
    if (this.analyses && this.analyses.measurementValueGenderAnalysis
      && this.showGraph === GraphType.Values) {
      this.displayMeasurementGraphs = true;
      if (this.analyses.measurementGenderCountAnalysis) {
        for (const aa of this.analyses.measurementGenderCountAnalysis) {
          let sumCount = 0;
          for (const ar of aa.results) {
            sumCount = sumCount + ar.countValue;
          }
          unitCounts.push({ name: aa.unitName, count : sumCount});
        }
      }
      unitCounts = unitCounts.sort((a, b) => {
          if (a.count < b.count) {
            return 1;
          }
          if (a.count > b.count) {
            return -1;
          }
          return 0;
        }
      );
      this.unitNames = unitCounts.map(d => d.name);
      const noUnit = this.unitNames.filter(n => n.toLowerCase() === 'no unit');
      this.unitNames = this.unitNames.filter(n => n.toLowerCase() !== 'no unit');
      if (noUnit.length > 0) {
        this.unitNames.push(noUnit[0]);
      }
      if (this.unitNames.length > 0) {
        this.selectedUnit = this.unitNames[0];
        this.showMeasurementGenderHistogram(this.unitNames[0]);
      }
    }
  }
  ngOnChanges() {
    // Get chart results for concept
    this.loadingStack.push(true);
    const conceptIdStr = '' + this.concept.conceptId.toString();
    this.conceptName = this.concept.conceptName;
    this.subscriptions.push(this.api.getConceptAnalysisResults([conceptIdStr],
      this.concept.domainId).subscribe(
      {
        next: results => {
          this.results = results.items;
          this.analyses = results.items[0];
          this.selectedSubGraph = 'Count';
          this.selectedMeasurementType = 'No unit (Text)';
          this.toDisplayGenderAnalysis = this.analyses.genderAnalysis;
          this.toDisplayAgeAnalysis = this.analyses.ageAnalysis;
          this.organizeGenders(this.analyses.genderAnalysis);
          this.fetchMeasurementGenderResults();
          // Set this var to make template simpler.
          // We can just loop through the results and show bins
          this.loadingStack.pop();
          this.displayGraphErrorMessage = false;
        },
        error: err => {
          const errorBody = JSON.parse(err._body);
          this.displayGraphErrorMessage = true;
          console.log('Error searching: ', errorBody.message);
        }
      }));
    this.loadingStack.push(true);
    this.subscriptions.push(this.api.getSourceConcepts(this.concept.conceptId).subscribe(
      results => {
        this.sourceConcepts = results.items;
        if (this.sourceConcepts.length > 10) {
          this.sourceConcepts = this.sourceConcepts.slice(0, 10);
        }
        this.loadingStack.pop();
      }));

    this.subscriptions.push(this.api.getCountAnalysis(this.concept.domainId, 'ehr').subscribe(
      results => {
        this.domainCountAnalysis = results;
      }
    ));
    if (this.showGraph !== GraphType.Values) {
      this.displayMeasurementGraphs = false;
    } else {
      this.displayMeasurementGraphs = true;
      this.fetchMeasurementGenderResults();
    }
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  // Organize genders and set the chart title for the gender charts for simple display
  organizeGenders(analysis: Analysis) {
    // No need to do anything if only one gender
    if (!analysis ||  analysis.results.length <= 1) {
      return;
    }
    for (const g of analysis.results) {
      const chartTitle = g.analysisStratumName
        + ' - ' + g.countValue.toLocaleString();
      if (g.stratum2 === this.dbc.MALE_GENDER_ID) {
        this.maleGenderResult = g;
        this.maleGenderChartTitle = chartTitle;
      }
      if (g.stratum2 === this.dbc.FEMALE_GENDER_ID) {
        this.femaleGenderResult = g;
        this.femaleGenderChartTitle = chartTitle;
      }
      if (g.stratum2 === this.dbc.INTERSEX_GENDER_ID) {
        this.intersexGenderResult = g;
        this.intersexGenderChartTitle = chartTitle;
      }
      if (g.stratum2 === this.dbc.NONE_GENDER_ID) {
        this.noneGenderResult = g;
        this.noneGenderChartTitle = chartTitle;
      } else if (g.stratum2 === this.dbc.OTHER_GENDER_ID) {
        this.otherGenderResult = g;
        this.otherGenderChartTitle = chartTitle;
      }
      if (g.stratum2 === this.dbc.OTHER_GENDER_ID) {
        this.otherGenderResult = g;
        this.otherGenderChartTitle = chartTitle;
      }
      if (g.stratum2 === this.dbc.OTHER_GENDER_ID) {
        this.otherGenderResult = g;
        this.otherGenderChartTitle = chartTitle;
      }
    }
    analysis.results = [];
    if (this.maleGenderResult) {
      analysis.results.push(this.maleGenderResult);
    }
    if (this.femaleGenderResult) {
      analysis.results.push(this.femaleGenderResult);
    }
    if (this.intersexGenderResult) {
      analysis.results.push(this.intersexGenderResult);
    }
    if (this.noneGenderResult) {
      analysis.results.push(this.noneGenderResult);
    }
    if (this.otherGenderResult) {
      analysis.results.push(this.otherGenderResult);
    }
  }

  showMeasurementGenderHistogram(unit: string) {
    this.selectedUnit = unit;
    if (this.selectedUnit.toLowerCase() === 'no unit') {
      const numericResults = this.analyses.measurementValueGenderAnalysis.find
      (aa => aa.unitName === unit).results.filter(r => r.measurementValueType === 'numeric');
      const textResults = this.analyses.measurementValueGenderAnalysis.find
      (aa => aa.unitName === unit).results.filter(r => r.measurementValueType === 'text');
      if (numericResults && numericResults.length > 0 && textResults && textResults.length > 0) {
        this.mixtureOfValues = true;
      } else {
        this.mixtureOfValues = false;
      }
    } else {
      this.mixtureOfValues = false;
    }
    this.toDisplayMeasurementGenderAnalysis = { ...this.analyses.measurementValueGenderAnalysis.find
      (aa => aa.unitName === unit) };
    if (this.analyses.measurementGenderCountAnalysis) {
      this.toDisplayMeasurementGenderCountAnalysis = this.analyses.measurementGenderCountAnalysis.
      find(aa => aa.unitName === unit);
    }
    if (this.mixtureOfValues) {
      this.toDisplayMeasurementGenderAnalysis.results =
        this.toDisplayMeasurementGenderAnalysis.results.
      filter(r => r.measurementValueType === 'text');
      this.selectedMeasurementType = 'No Unit (Text)';
    }
  }

  public fetchChartTitle(gender: any) {
    if (this.toDisplayMeasurementGenderCountAnalysis) {
      const genderResults = this.toDisplayMeasurementGenderCountAnalysis.results
        .filter(r => r.stratum3 === gender.stratum2)[0];
      if (genderResults) {
        return genderResults.countValue;
      } else {
        return 20;
      }
    } else {
      return gender.countValue;
    }
  }

  public showSpecificMeasurementTypeValues(su) {
    this.selectedMeasurementType = su;
    if (su.toLowerCase().indexOf('text') >= 0) {
      this.toDisplayMeasurementGenderAnalysis = {
        ...this.analyses.measurementValueGenderAnalysis.find
        (aa => aa.unitName === 'No unit')};
      this.toDisplayMeasurementGenderAnalysis.results =
        this.toDisplayMeasurementGenderAnalysis.results.filter
      (r => r.measurementValueType === 'text');
      if (this.analyses.measurementGenderCountAnalysis) {
        this.toDisplayMeasurementGenderCountAnalysis =
          this.analyses.measurementGenderCountAnalysis.find
        (aa => aa.unitName === 'No unit');
      }
    } else {
      this.toDisplayMeasurementGenderAnalysis = {
        ...this.analyses.measurementValueGenderAnalysis.find(
          aa => aa.unitName === 'No unit')};
      this.toDisplayMeasurementGenderAnalysis.results =
        this.toDisplayMeasurementGenderAnalysis.results.filter
      (r => r.measurementValueType === 'numeric');
      if (this.analyses.measurementGenderCountAnalysis) {
        this.toDisplayMeasurementGenderCountAnalysis =
          this.analyses.measurementGenderCountAnalysis.find
        (aa => aa.unitName === 'No unit');
      }
    }
  }
}
