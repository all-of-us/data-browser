import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import {Observable} from 'rxjs/Observable';

import {SignInService} from 'app/services/sign-in.service';
import {ServerConfigService} from 'app/services/server-config.service';


declare const gapi: any;

@Injectable()
export class SignInGuard implements CanActivate, CanActivateChild {
  constructor(private serverConfigService: ServerConfigService,
              private signInService: SignInService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.serverConfigService.getConfig().flatMap(config => {
      if (!config.requireSignIn) {
        return Observable.from([true]);
      }
      return this.signInService.isSignedIn$.do(
        isSignedIn => isSignedIn || this.router.navigate(['/login']));
    )
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }
}
