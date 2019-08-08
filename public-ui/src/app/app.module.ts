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
import { ResearchDirectoryModule } from './research-directory/research-directory.module';
import { ErrorReporterService } from './services/error-reporter.service';
import { ServerConfigService } from './services/server-config.service';
import { SignInService } from './services/sign-in.service';
import { AppComponent, overriddenUrlKey } from './views/app/app.component';
// Unfortunately stackdriver-errors-js doesn't properly declare dependencies, so
// we need to explicitly load its StackTrace dep:
// https://github.com/GoogleCloudPlatform/stackdriver-errors-js/issues/2
(<any>window).StackTrace = StackTrace;
import { ConfigService, DataBrowserService } from 'publicGenerated';
import { DbConfigService } from './utils/db-config.service';
import { TooltipService } from './utils/tooltip.service';
import { overriddenPublicUrlKey } from './views/app/app.component';


function getPublicBasePath() {
  return localStorage.getItem(overriddenPublicUrlKey) || environment.publicApiUrl;
}

// if true show Research Dir; hide Data browser


const dynamicImports = [
  BrowserModule,
  BrowserAnimationsModule,
  ApiModule,
  RouterModule
];



// "Configuration" means Swagger API Client configuration.
export function getConfiguration(signInService: SignInService): Configuration {
  return new Configuration({
    basePath: getPublicBasePath(),
    accessToken: () => signInService.currentAccessToken
  });
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
    DataBrowserModule,
    ResearchDirectoryModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    {
      provide: ConfigService,
      useFactory: getConfigService,
      deps: [Http]
    },
    {
      provide: Configuration,
      deps: [SignInService],
      useFactory: getConfiguration
    },
    DbConfigService,
    TooltipService,
    ServerConfigService,
    {
      provide: ErrorHandler,
      deps: [ServerConfigService],
      useClass: ErrorReporterService,
    },
    SignInService,
  ],
  // This specifies the top-level components, to load first.
  bootstrap: [AppComponent]

})
export class AppModule { }
