import "rxjs/add/operator/mergeMap";

import { environment } from "environments/environment";
import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { ServerConfigService } from "app/services/server-config.service";
import { throwError } from "rxjs";
import { Observable } from "rxjs/Observable";
import { from as observableFrom } from "rxjs/observable/from";
import { catchError } from "rxjs/operators";

declare const gapi: any;

@Injectable()
export class IsSafeGuard implements CanActivate, CanActivateChild {
  constructor(
    private serverConfigService: ServerConfigService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    if (state.url.indexOf("genomic-variants") > -1 && !environment.geno) {
      this.router.navigate(["/"]);
    }
    return this.serverConfigService
      .getConfig()
      .flatMap((config) => {
        // if true function and normal else show emergency page
        if (config.dataBrowserIsSafe) {
          return observableFrom([true]);
        }
        this.router.navigate(["/error"]);
        return observableFrom([false]);
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          this.router.navigate(["/error"]);
          return observableFrom([false]);
        })
      );
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(route, state);
  }
}
