import { Component, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import {DataBrowserService} from '../../../../publicGenerated/api/dataBrowser.service';
import {DbConfigService} from '../../../utils/db-config.service';

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

  constructor(private api: DataBrowserService, public dbc: DbConfigService) { }

  loading() {
    return this.loadingStack.length > 0;
  }

  ngOnInit() {
    this.searchText = localStorage.getItem('searchText');
    this.fitbitConcepts.push({id: 1, displayName: 'All Fitbit Data',
    conceptName: 'All Fitbit Data', icon: 'fa-watch-fitness'});
    this.fitbitConcepts.push({id: 2, displayName: 'Heart rate by zone summary',
    conceptName: 'Heart Rate (Summary)', icon: 'fa-heartbeat'});
    this.fitbitConcepts.push({id: 3, displayName: 'Heart rate (minute-level)',
    conceptName: 'Heart rate (minute-level)', icon: 'fa-monitor-heart-rate'});
    this.fitbitConcepts.push({id: 4, displayName: 'Activity (dialy summary)',
    conceptName: 'Activity (daily summary)', icon: 'fa-running'});
    this.fitbitConcepts.push({id: 5, displayName: 'Activity intraday steps (minute-level)',
    conceptName: 'Activity intraday steps (minute-level)', icon: 'fa-walking'});
    console.log(this.fitbitConcepts);
    // this.api.getFitbitAnalysis(this.dbc.FITBIT_MEASUREMENTS);

    this.loadingStack.push(true);
        this.subscriptions.push(this.api.getFitbitAnalysisResults(this.dbc.FITBIT_MEASUREMENTS)
                  .subscribe({
                    next: result => {
                      console.log(result);
                      // Process fitbit results
                      this.loadingStack.pop();
                    },
                    error: err =>  {
                      this.loadingStack.pop();
                      console.log('Error: ', err);
                    }
            }));
  }

}
