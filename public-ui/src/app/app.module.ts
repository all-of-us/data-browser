import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { environment } from 'environments/environment';
/* Our Modules */
import {
  ApiModule,
  Configuration
} from 'publicGenerated';
import * as StackTrace from 'stacktrace-js';
import { DataBrowserModule } from './data-browser/data-browser.module';
import { ErrorReporterService } from './services/error-reporter.service';
import { ServerConfigService } from './services/server-config.service';
import { SharedModule } from './shared/shared.module';
import { AppComponent, overriddenUrlKey } from './views/app/app.component';
// Unfortunately stackdriver-errors-js doesn't properly declare dependencies, so
// we need to explicitly load its StackTrace dep:
// https://github.com/GoogleCloudPlatform/stackdriver-errors-js/issues/2
(<any>window).StackTrace = StackTrace;
import { ConfigService, DataBrowserService } from 'publicGenerated';
import { Configuration as newConfig } from '../publicGenerated/fetch';
import { DataBrowserApi } from '../publicGenerated/fetch/api';
import { DbConfigService } from './utils/db-config.service';
import { TooltipService } from './utils/tooltip.service';
import { overriddenPublicUrlKey } from './views/app/app.component';

function getPublicBasePath() {
  return environment.publicApiUrl;
}


// "Configuration" means Swagger API Client configuration.
export function getConfiguration(): Configuration {
  return new Configuration({
    basePath: getPublicBasePath(),
  });
}

export function getNewConfiguration(http: HttpClientModule) {
  return new newConfig({ basePath: getPublicBasePath() });
}

export function getConfigService(http: Http) {
  return new ConfigService(http, getPublicBasePath(), null);
}



@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ApiModule,
    RouterModule,
    SharedModule,
    DataBrowserModule,
    HttpClientModule
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    {
      provide: ConfigService,
      useFactory: getConfigService,
      deps: [Http]
    },
    {
      provide: DataBrowserApi,
      useFactory: getNewConfiguration,
      deps: [HttpClientModule]
    },
    {
      provide: ConfigService,
      useFactory: getConfigService,
      deps: [Http]
    },
    {
      provide: Configuration,
      useFactory: getConfiguration
    },
    DbConfigService,
    TooltipService,
    ServerConfigService,
    {
      provide: ErrorHandler,
      deps: [ServerConfigService],
      useClass: ErrorReporterService,
    }
  ],
  // This specifies the top-level components, to load first.
  bootstrap: [AppComponent]

})
export class AppModule { }
