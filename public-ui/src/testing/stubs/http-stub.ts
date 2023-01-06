import { HttpClient } from "@angular/common/http/";
import { Observable } from "rxjs/Observable";

export class HttpStub {
  public get(_url: string, _options?: HttpClient): Observable<Response> {
    return new Observable<Response>((observer) => {
      setTimeout(() => {
        observer.next(new Response());
        observer.complete();
      }, 0);
    });
  }
}
