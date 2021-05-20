import { NgModule } from '@angular/core';

import {bindApiClients} from 'app/services/swagger-fetch-clients';
import {environment} from 'environments/environment';
import {Configuration} from 'publicGenerated/fetch';


// "Configuration" means Swagger API Client configuration.
export function getConfiguration(): Configuration {
  return new Configuration({
    basePath: environment.publicApiUrl
  });
}

/**
 * This module requires a FETCH_API_REF and FetchConfiguration instance to be
 * provided. Unfortunately typescript-fetch does not provide this module by
 * default, so a new entry will need to be added below for each new API service
 * added to the Swagger interfaces.
 */
@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [{
    provide: Configuration,
    deps: [],
    useFactory: getConfiguration
  }]
})
export class FetchModule {
  constructor(conf: Configuration) {
    bindApiClients(conf);
  }
}
