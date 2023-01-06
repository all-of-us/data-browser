import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigResponse, ConfigService } from "publicGenerated";
import { throwError } from "rxjs";
import { Observable } from "rxjs/Observable";
import { catchError } from "rxjs/operators";
import { ReplaySubject } from "rxjs/ReplaySubject";

@Injectable()
export class ServerConfigService {
  private configObs: Observable<ConfigResponse>;
  constructor(private configService: ConfigService) {}

  public getConfig(): Observable<ConfigResponse> {
    if (!this.configObs) {
      // Use of a replaySubject() caches the output of the API call across subscriptions.
      const subject = new ReplaySubject<ConfigResponse>();
      this.configObs = subject.asObservable();

      this.configService.getConfig().subscribe({
        next: (result) => {
          subject.next(result);
        },
        error: (err) => {
          subject.error(err);
        },
      });

      // this.configService.getConfig().subscribe(subject);
    }
    return this.configObs;
  }
}
