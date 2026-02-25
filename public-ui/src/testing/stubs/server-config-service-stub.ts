import { ConfigResponse } from "publicGenerated";
import { BehaviorSubject, Observable } from "rxjs";

export class ServerConfigServiceStub {
  constructor(public config: ConfigResponse) {}

  public getConfig(): Observable<ConfigResponse> {
    return new BehaviorSubject<ConfigResponse>(this.config).asObservable();
  }
}
