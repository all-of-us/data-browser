// The main file is boilerplate; AppModule configures our app.

import { environment } from "environments/environment";
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "app/app.module";

if (!environment.debug) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
