import { DOCUMENT, Location } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Event as RouterEvent,
  NavigationEnd, NavigationStart,
  Router,
} from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { environment } from 'environments/environment';

import {ServerConfigService} from 'app/services/server-config.service';
import { SignInService } from 'app/services/sign-in.service';

export const overriddenUrlKey = 'allOfUsApiUrlOverride';
export const overriddenPublicUrlKey = 'publicApiUrlOverride';


@Component({
  selector: 'app-public-aou',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  overriddenUrl: string = null;
  private baseTitle: string;
  private overriddenPublicUrl: string = null;
  public noHeaderMenu = false;
  signedIn = false;
  requireSignIn = false;

  constructor(
    /* Ours */
    @Inject(DOCUMENT) private doc: any,
    /* Angular's */
    private activatedRoute: ActivatedRoute,
    private locationService: Location,
    private router: Router,
    private serverConfigService: ServerConfigService,
    private signInService: SignInService,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.overriddenUrl = localStorage.getItem(overriddenUrlKey);
    this.overriddenPublicUrl = localStorage.getItem(overriddenPublicUrlKey);
    this.serverConfigService.getConfig().subscribe((config) => {
      this.requireSignIn = config.requireSignIn;
    });

    this.signInService.isSignedIn$.subscribe((isSignedIn) => {
      this.signedIn = isSignedIn;
    });

    window['setPublicApiUrl'] = (url: string) => {
      if (url) {
        if (!url.match(/^https?:[/][/][a-z0-9.:-]+$/)) {
          throw new Error('URL should be of the form "http[s]://host.example.com[:port]"');
        }
        this.overriddenPublicUrl = url;
        localStorage.setItem(overriddenPublicUrlKey, url);
      } else {
        this.overriddenPublicUrl = null;
        localStorage.removeItem(overriddenPublicUrlKey);
      }
      window.location.reload();
    };
    console.log('activatedRoute ', this.activatedRoute);
    console.log('To override the API URLs, try:\n' +
      'setAllOfUsApiUrl(\'https://host.example.com:1234\')\n' +
      'setPublicApiUrl(\'https://host.example.com:5678\')');

    // Pick up the global site title from HTML, and (for non-prod) add a tag
    // naming the current environment.
    this.baseTitle = this.titleService.getTitle();
    if (environment.displayTag) {
      this.baseTitle = `[${environment.displayTag}] ${this.baseTitle}`;
      this.titleService.setTitle(this.baseTitle);
    }

    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: RouterEvent) => {
        // Set the db header no menu if we are on home page
        // Not sure why an instance of RouteConfigLoadStart comes in here when we filter
        if (event instanceof NavigationEnd && event.url === '/') {
          this.noHeaderMenu = true;
        }
        this.setTitleFromRoute(event);
      });

    this.setTagManager();
    this.setTCellAgent();
  }

  /**
   * Uses the title service to set the page title after nagivation events
   */
  private setTitleFromRoute(event: RouterEvent): void {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    if (currentRoute.outlet === 'primary') {
      currentRoute.data.subscribe(value =>
        this.titleService.setTitle(`${value.title} | ${this.baseTitle}`));
    }
  }

  /**
   * Setting the Google Analytics ID here.
   * This first injects Google's gtm script via iife.
   */
  private setTagManager() {
    const s = this.doc.createElement('script');
    s.type = 'text/javascript';
    s.innerHTML =
      '(function(w,d,s,l,i){' +
      'w[l]=w[l]||[];' +
      'w[l].push({\'gtm.start\':new Date().getTime(),event:\'gtm.js\'});' +
      'var f=d.getElementsByTagName(s)[0];' +
      'var j=d.createElement(s);' +
      'var dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';' +
      'j.async=true;' +
      'j.src=\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl+ ' +
      '\'&gtm_auth=' + environment.gtmAuth + '&gtm_preview=' + environment.gtmPreview +
      '&gtm_cookies_win=x\';' +
      'f.parentNode.insertBefore(j,f);' +
      '})' +
      '(window, document, \'script\', \'dataLayer\', \'' + environment.gtmId + '\');';
    const head = this.doc.getElementsByTagName('head')[0];
    head.appendChild(s);
    // Set gtag manager in body in case script in head is not activated
    const script = this.doc.createElement('noscript');
    script.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=`
      + environment.gtmId + '&gtm_auth=' + environment.gtmAuth +
      `&gtm_preview=` + environment.gtmPreview + `&gtm_cookies_win=x"` +
      `height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    const body = this.doc.getElementsByTagName('body')[0];
    body.appendChild(script);
  }

  private setTCellAgent(): void {
    const s = this.doc.createElement('script');
    s.type = 'text/javascript';
    s.src = 'https://jsagent.tcell.io/tcellagent.min.js';
    s.setAttribute('tcellappid', environment.tcellappid);
    s.setAttribute('tcellapikey', environment.tcellapikey);
    const head = this.doc.getElementsByTagName('head')[0];
    head.appendChild(s);
  }

  onActivate() {
    window.scroll(0, 0);
  }

}
