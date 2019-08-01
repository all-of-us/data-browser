import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Routes } from '@angular/router';
import { environment } from '../../environments/environment';
import { IsSafeGuard } from '../guards/is-safe-guard.service';
import { SignInGuard } from '../guards/sign-in-guard.service';
import { LoginComponent } from '../views/login/login.component';
import { ResearchDirViewComponent } from './views/research-dir-view/research-dir-view.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Sign In' }
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
          title: 'AoU Research',
          breadcrumb: {
            value: 'AoU Research',
          }
        },
        children: [{
          path: '',
          component: ResearchDirViewComponent,
        }]
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
