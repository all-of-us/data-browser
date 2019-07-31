import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { environment } from '../../environments/environment';

import { IsSafeGuard } from '../guards/is-safe-guard.service';
import { SignInGuard } from '../guards/sign-in-guard.service';
import { ResearchDirectoryComponent } from '../research-directory/views/research-directory/research-directory.component';
import { LoginComponent } from '../views/login/login.component';

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
    path: '',
    canActivate: [SignInGuard],
    canActivateChild: [SignInGuard],
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        data: {
          title: 'Research Directory',
          breadcrumb: {
            value: 'Research Directory',
          }
        },
        children: [{
          path: '',
          component: ResearchDirectoryComponent,
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

  ]
})
export class ResearchDirectoryRoutingModule {

  constructor(public router: Router) {
    this.router.events.subscribe(event => {
    });
  }
}
