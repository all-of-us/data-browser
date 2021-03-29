import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Event as RouterEvent,
  NavigationEnd,
  Router,
} from '@angular/router';
import {initializeAnalytics} from 'app/utils/google_analytics';
import { environment } from 'environments/environment';
import {filter} from 'rxjs/operators';

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


  constructor(
    /* Angular's */
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('searchText');
    localStorage.removeItem('treeHighlight');
    this.overriddenUrl = localStorage.getItem(overriddenUrlKey);
    this.overriddenPublicUrl = localStorage.getItem(overriddenPublicUrlKey);


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
    // this log looks useful
    // console.log('To override the API URLs, try:\n' +
    //   'setAllOfUsApiUrl(\'https://host.example.com:1234\')\n' +
    //   'setPublicApiUrl(\'https://host.example.com:5678\')');

    // Pick up the global site title from HTML, and (for non-prod) add a tag
    // naming the current environment.
    this.baseTitle = this.titleService.getTitle();
    if (environment.displayTag) {
      this.baseTitle = (environment.displayTag.toLowerCase() === 'prod') ?
      `${this.baseTitle}` : `[${environment.displayTag}] ${this.baseTitle}`;
      this.titleService.setTitle(this.baseTitle);
    }

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd))
      .subscribe((event: RouterEvent) => {
        // Set the db header no menu if we are on home page
        // Not sure why an instance of RouteConfigLoadStart comes in here when we filter
        if (event instanceof NavigationEnd && event.url === '/') {
          this.noHeaderMenu = true;
        }
        this.setTitleFromRoute(event);
      });

    initializeAnalytics();
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

  onActivate() {
    window.scroll(0, 0);
  }
}
