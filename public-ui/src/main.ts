// The main file is boilerplate; AppModule configures our app.

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from 'app/app.module';
import {environment} from 'environments/environment';

if (!environment.debug) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
