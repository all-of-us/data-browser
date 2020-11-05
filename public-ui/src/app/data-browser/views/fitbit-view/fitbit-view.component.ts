import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { DataBrowserService } from '../../../../publicGenerated/api/dataBrowser.service';
import { DbConfigService } from '../../../utils/db-config.service';

@Component({
  selector: 'app-fitbit-view',
  templateUrl: './fitbit-view.component.html',
  styleUrls: ['../../../styles/template.css', './fitbit-view.component.css']
})
export class FitbitViewComponent implements OnInit {
  title = 'Fitbit Data';
  private subscriptions: ISubscription[] = [];
  loadingStack: any = [];
  fitbitConcepts: any = [];
  searchText: string = null;
  isLoading = false;
  analyses: any;
  selectedAnalyses: any;
  selectedItem = 'All Fitbit Data';
  selectedDisplay = 'All Fitbit Data';

  constructor(private api: DataBrowserService, public dbc: DbConfigService) { }

  loading() {
    return this.loadingStack.length > 0;
  }

  ngOnInit() {
    this.searchText = localStorage.getItem('searchText');
    this.fitbitConcepts.push({
      id: 1, displayName: 'All Fitbit Data',
      conceptName: 'All Fitbit Data', icon: 'fa-watch-fitness'
    });
    this.fitbitConcepts.push({
      id: 2, displayName: 'Heart rate by zone summary',
      conceptName: 'Heart Rate (Summary)', icon: 'fa-heartbeat'
    });
    this.fitbitConcepts.push({
      id: 3, displayName: 'Heart rate (minute-level)',
      conceptName: 'Heart rate (minute-level)', icon: 'fa-monitor-heart-rate'
    });
    this.fitbitConcepts.push({
      id: 4, displayName: 'Activity (daily summary)',
      conceptName: 'Activity (daily summary)', icon: 'fa-running'
    });
    this.fitbitConcepts.push({
      id: 5, displayName: 'Activity intraday steps (minute-level)',
      conceptName: 'Activity intraday steps (minute-level)', icon: 'fa-walking'
    });

    this.loadingStack.push(true);
    this.subscriptions.push(this.api.getFitbitAnalysisResults(this.dbc.FITBIT_MEASUREMENTS)
      .subscribe({
        next: result => {
          this.analyses = result.items;
          for (const item of result.items) {
              const fitbitConcept = this.fitbitConcepts.filter(concept =>
              concept.conceptName.toLowerCase().includes(item.conceptId.toLowerCase()))[0];
              fitbitConcept['ageAnalysis'] = item.ageAnalysis;
              fitbitConcept['genderAnalysis'] = item.genderAnalysis;
              fitbitConcept['countAnalysis'] = item.countAnalysis;
              fitbitConcept['participantCountAnalysis'] = item.participantCountAnalysis;
          }
          if (this.searchText) {
            const matchingConcepts = this.fitbitConcepts.filter(concept =>
            concept.conceptName.toLowerCase().includes(this.searchText.toLowerCase()));
            if (matchingConcepts && matchingConcepts.length > 0) {
                this.selectedItem = matchingConcepts[0].conceptName;
                this.selectedDisplay = matchingConcepts[0].displayName;
                this.selectedAnalyses = matchingConcepts[0];
            }
          }
          this.selectedAnalyses = result.items[0];
          this.isLoading = true;
          // Process fitbit results
          this.loadingStack.pop();
        },
        error: err => {
          this.loadingStack.pop();
          console.log('Error: ', err);
        }
      }));
  }

  setGraphs(conceptObj) {
    this.analyses.forEach(concept => {
      if (conceptObj.conceptName === concept.conceptId) {
        this.selectedAnalyses = concept;
      }
    });
    this.selectedItem = conceptObj.conceptName;
    this.selectedDisplay = conceptObj.displayName;
  }

}
