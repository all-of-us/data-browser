import { environment } from "environments/environment";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import {
  ActivatedRoute,
  Event as RouterEvent,
  NavigationEnd,
  Router,
} from "@angular/router";
import { initializeAnalytics } from "app/utils/google_analytics";
import {
  queryParamsStore,
  routeConfigDataStore,
  urlParamsStore,
} from "app/utils/navigation";
import { filter, map } from "rxjs/operators";

export const overriddenUrlKey = "allOfUsApiUrlOverride";
export const overriddenPublicUrlKey = "publicApiUrlOverride";

@Component({
  selector: "app-public-aou",
  styleUrls: ["./app.component.css"],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  overriddenUrl: string = null;
  private baseTitle: string;
  public noHeaderMenu = false;
  public testReact: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.testReact = environment.testReact;
    localStorage.removeItem("searchText");
    localStorage.removeItem("treeHighlight");
    this.overriddenUrl = localStorage.getItem(overriddenUrlKey);

    // Initialize the global base title
    this.baseTitle = environment.displayTag
      ? environment.displayTag.toLowerCase() === "prod"
        ? "All of Us Public Data Browser"
        : `[${environment.displayTag}] All of Us Public Data Browser`
      : "All of Us Public Data Browser";

    // Subscribe to router events to dynamically set page titles
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.getLeafRoute()), // Get the deepest activated route
        map((route) => route.snapshot.data?.title || ""), // Extract the route title
      )
      .subscribe((routeTitle: string) => {
        const fullTitle = routeTitle
          ? `${routeTitle} | ${this.baseTitle}`
          : this.baseTitle; // Avoid adding a pipe if title is empty
        this.titleService.setTitle(fullTitle);
        console.log("Route Title Set:", fullTitle); // For debugging
      });

    // Handle additional router events for query params and dynamic navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const {
          snapshot: { params, queryParams, routeConfig },
        } = this.getLeafRoute();
        urlParamsStore.next(params);
        queryParamsStore.next(queryParams);
        routeConfigDataStore.next(routeConfig?.data || {});
        this.noHeaderMenu = this.router.url === "/"; // Set noHeaderMenu for the home page
      });

    // Initialize analytics
    initializeAnalytics();

    // Public API URL override function
    window.setPublicApiUrl = (url: string) => {
      if (url) {
        if (!url.match(/^https?:[/][/][a-z0-9.:-]+$/)) {
          throw new Error(
            'URL should be of the form "http[s]://host.example.com[:port]"'
          );
        }
        localStorage.setItem(overriddenPublicUrlKey, url);
      } else {
        localStorage.removeItem(overriddenPublicUrlKey);
      }
      window.location.reload();
    };
  }

  /**
   * Recursively gets the deepest active route.
   */
  getLeafRoute(route = this.activatedRoute) {
    return route.firstChild ? this.getLeafRoute(route.firstChild) : route;
  }

  /**
   * Scroll to the top of the page when a new component is activated.
   */
  onActivate() {
    window.scroll(0, 0);
  }
}
