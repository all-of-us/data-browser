import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { environment } from '../../environments/environment';

import { IsSafeGuard } from '../guards/is-safe-guard.service';
import { EmergencyComponent } from '../views/emergency/emergency.component';
import { EhrViewComponent } from './views/ehr-view/ehr-view.component';
import { FitbitViewComponent } from './views/fitbit-view/fitbit-view.component';
import { IntroVidsComponent } from './views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from './views/pm/pm.component';
import { QuickSearchComponent } from './views/quick-search/quick-search.component';
import { SurveyViewComponent } from './views/survey-view/survey-view.component';

const routes: Routes = [
  {
    path: 'error',
    pathMatch: 'full',
    component: EmergencyComponent,
    data: { title: 'ERROR' }
  },
  {
    path: 'ehr',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'survey',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivateChild: [IsSafeGuard],
    children: [
      {
        path: '',
        data: {
          title: 'Data Browser',
          breadcrumb: {
            value: 'Data Browser',
          }
        },
        children: [{
          path: '',
          component: QuickSearchComponent,
        },
        {
          path: 'survey/:id',
          component: SurveyViewComponent,
          data: {
            title: 'View Survey Questions and Answers',
            breadcrumb: {
              value: ':id survey',
            }
          }
        },
        {
          path: 'ehr/:id',
          component: EhrViewComponent,
          data: {
            title: 'View Full Results',
            breadcrumb: {
              value: ':id Domain',
            }
          }
        },
        {
          path: 'physical-measurements',
          component: PhysicalMeasurementsComponent,
          data: {
            title: 'Physical Measurements from Enrollment',
            breadcrumb: {
              value: 'physical measurements'
            }
          }
        },
        {
            path: 'fitbit',
                  component: FitbitViewComponent,
                  data: {
                    title: 'Fitbit Data',
                    breadcrumb: {
                      value: 'Fitbit Data'
                    }
                  }
         },
        {
          path: 'introductory-videos',
          component: IntroVidsComponent,
          data: {
            title: 'Introductory Videos',
            breadcrumb: {
              value: 'introductory videos'
            }
          }
        }
        ]
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
  providers: [
    IsSafeGuard,
  ]
})
export class DataBrowserRoutingModule {

  constructor(public router: Router) {
    this.router.events.subscribe(event => {
    });
  }
}
