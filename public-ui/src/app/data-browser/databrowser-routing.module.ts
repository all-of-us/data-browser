import { NgModule } from '@angular/core';
import {ActivatedRoute , Router, RouterModule, Routes } from '@angular/router';
import { IsSafeGuard } from 'app/guards/is-safe-guard.service';
import {NavStore} from 'app/utils/navigation';
import { EmergencyComponent } from 'app/views/emergency/emergency.component';
import { EhrViewComponent } from './views/ehr-view/ehr-view.component';
import { QuickSearchComponent } from './views/quick-search/quick-search.component';
import { SurveyViewComponent } from './views/survey-view/survey-view.component';


import {AppRouting} from 'app/app-routing';

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
          component: AppRouting,
          data: {}
        },
        {
          path: 'survey/:id',
          component: AppRouting,
          data: {
            title: 'View Survey Questions and Answers',
            breadcrumb: {
              value: ':id survey',
            }
          }
        },
        {
          path: 'survey/:id/:search',
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
          component: AppRouting,
          data: {
            title: 'View Full Results',
            breadcrumb: {
              value: ':id Domain',
            }
          }
        },
        {
          path: 'ehr/:id/:search',
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
          component: AppRouting,
          data: {
            title: 'Physical Measurements',
            breadcrumb: {
                value: 'Physical Measurements'
            }
          }
        },
        {
          path: 'physical-measurements/:search',
          component: AppRouting,
          data: {
            title: 'Physical Measurements',
            breadcrumb: {
                value: 'Physical Measurements'
            }
          }
        },
        {
          path: 'fitbit',
          component: AppRouting,
          data: {
            title: 'Fitbit Data',
            breadcrumb: {
                value: 'Fitbit Data'
            }
          }
        },
        {
          path: 'fitbit/:search',
          component: AppRouting,
          data: {
            title: 'Fitbit Data',
            breadcrumb: {
                value: 'Fitbit Data'
            }
          }
        },
        {
          path: 'introductory-videos',
          component:  AppRouting,
          data: {
            title: 'Introductory Videos',
            breadcrumb: {
                value: 'Introductory Videos'
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
