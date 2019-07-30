import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';

import { EhrViewComponent } from './data-browser/views/ehr-view/ehr-view.component';
import { IntroVidsComponent } from './data-browser/views/intro-vids/intro-vids.component';
import { PhysicalMeasurementsComponent } from './data-browser/views/pm/pm.component';
import { QuickSearchComponent } from './data-browser/views/quick-search/quick-search.component';
import { SurveyViewComponent } from './data-browser/views/survey-view/survey-view.component';
import { IsSafeGuard } from './guards/is-safe-guard.service';
import { SignInGuard } from './guards/sign-in-guard.service';
import { ResearchDirectoryComponent } from './research-directory/views/research-directory/research-directory.component'
import { EmergencyComponent } from './views/emergency/emergency.component';
import { LoginComponent } from './views/login/login.component';
 
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Sign In' }
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
    path: 'error',
    pathMatch: 'full',
    component: EmergencyComponent,
    data: { title: 'ERROR' }
  },
  {
    path: '',
    canActivate: [SignInGuard, IsSafeGuard],
    canActivateChild: [SignInGuard, IsSafeGuard],
    runGuardsAndResolvers: 'always',
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
          path: 'survey/:id/:searchString',
          component: SurveyViewComponent,
          data: {
            title: 'View Full Results',
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
          path: 'ehr/:id/:searchString',
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
    SignInGuard,
    IsSafeGuard,
  ]
})
export class AppRoutingModule {

  constructor(public router: Router) {
    this.router.events.subscribe(event => {
    });
  }
}
