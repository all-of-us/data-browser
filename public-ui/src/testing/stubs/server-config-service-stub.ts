import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

import {ConfigResponse} from 'publicGenerated';

export class ServerConfigServiceStub {
  constructor(public config: ConfigResponse) {}

  public getConfig(): Observable<ConfigResponse> {
    return new BehaviorSubject<ConfigResponse>(this.config).asObservable();
  }
}
