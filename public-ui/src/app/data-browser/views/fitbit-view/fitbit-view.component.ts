import { Component, OnInit } from '@angular/core';
import { TooltipService } from 'app/data-browser/services/tooltip.service';
import { DbConfigService } from 'app/utils/db-config.service';
import { environment } from 'environments/environment';
import { DataBrowserService } from 'publicGenerated/api/dataBrowser.service';
import { Subscription as ISubscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-fitbit-view',
  templateUrl: './fitbit-view.component.html',
  styleUrls: ['../../../styles/template.css', './fitbit-view.component.css']
})
export class FitbitViewComponent implements OnInit {
  private subscriptions: ISubscription[] = [];
  constructor() {
  }

  ngOnInit() {
  }
}
