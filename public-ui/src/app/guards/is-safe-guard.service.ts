import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router, RouterStateSnapshot
} from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { ServerConfigService } from 'app/services/server-config.service';


declare const gapi: any;

@Injectable()
export class IsSafeGuard implements CanActivate, CanActivateChild {
  constructor(private serverConfigService: ServerConfigService,
    private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.serverConfigService.getConfig().flatMap(config => {
      // if true function and normal else show emergency page
      if (config.dataBrowserIsSafe) {
        return Observable.from([true]);
      }
        this.router.navigate(['/error']);
        return Observable.from([false]);
    });
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }
}
