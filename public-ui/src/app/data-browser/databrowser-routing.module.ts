import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { IsSafeGuard } from 'app/guards/is-safe-guard.service';
import {NavStore} from 'app/utils/navigation';
import { EmergencyComponent } from 'app/views/emergency/emergency.component';
import { EhrViewComponent } from './views/ehr-view/ehr-view.component';
import { FitbitViewComponent } from './views/fitbit-view/fitbit-view.component';
import { IntroVidsWrapperComponent } from './views/intro-vids/intro-vids-react.component';
import { PhysicalMeasurementsComponent } from './views/pm/pm.component';
import { QuickSearchComponent } from './views/quick-search/quick-search.component';
import { SurveyViewComponent } from './views/survey-view/survey-view.component';
import { PhysicalMeasurementsWrapperComponent } from 'app/data-browser/views/pm/pm-react.component';

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
          component: PhysicalMeasurementsWrapperComponent,
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
          component: IntroVidsWrapperComponent,
          data: {
            title: 'Introductory Videos',
            breadcrumb: {
              value: 'introductory videos'
            }
          }
        }]
      }
    ]
  }

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
    NavStore.navigate = (commands, extras) => this.router.navigate(commands, extras);
    NavStore.navigateByUrl = (url, extras) => this.router.navigateByUrl(url, extras);
    this.router.events.subscribe(event => {});
  }
}
