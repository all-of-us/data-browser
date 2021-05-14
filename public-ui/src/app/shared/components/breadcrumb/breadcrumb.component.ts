import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {routeDataStore, RouteDataStore} from 'app/utils/stores';
import { environment } from 'environments/environment';
import {filter} from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

export interface Breadcrumb {
  label: string;
  isIntermediate: boolean;
  url: string;
}
@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: [
    '../../../styles/buttons.css',
    '../../../styles/page.css',
    '../../../styles/headers.css',
    '../../../styles/inputs.css',
    './breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  breadcrumbs: Breadcrumb[];
  routeData: RouteDataStore;
  allOfUs = environment.researchAllOfUsUrl;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router) { }

  /**
   * Generate a breadcrumb using the default label and url. Uses the route's
   * paramMap to do any necessary variable replacement. For example, if we
   * have a label value of ':wsid' as defined in a route's breadcrumb, we can
   * do substitution with the 'wsid' value in the route's paramMap.
   */
  private static makeBreadcrumb(label: string,
    isIntermediate: boolean,
    url: string,
    route: ActivatedRoute): Breadcrumb {
    let newLabel = label;
    // Perform variable substitution in label only if needed.
    if (newLabel.indexOf(':') >= 0) {
      const paramMap = route.snapshot.paramMap;
      for (const k of paramMap.keys) {
        if (paramMap.get(k).indexOf('?') >= 0) {
          newLabel = newLabel.replace(':' + k, paramMap.get(k).substring(0, paramMap.get(k).indexOf('?')));
        } else {
          newLabel = newLabel.replace(':' + k, paramMap.get(k));
        }
      }
    }
    if (newLabel.toLowerCase().indexOf('utilization') > 0) {
      newLabel = newLabel.replace('and', '&');
    }
    return {
      label: newLabel,
      isIntermediate: isIntermediate,
      url: url
    };
  }

  /**
   * Filters an array of Breadcrumbs so that the last element is never an intermediateBreadcrumb
   * This ensures that breadcrumb headers are displayed correctly while still tracking
   * intermediate pages.
   */
  private static filterBreadcrumbs(breadcrumbs: Breadcrumb[]): Array<Breadcrumb> {
    if (breadcrumbs.length > 0) {
      let last = breadcrumbs[breadcrumbs.length - 1];
      while ((breadcrumbs.length > 1) && (last.isIntermediate)) {
        breadcrumbs.pop();
        last = breadcrumbs[breadcrumbs.length - 1];
      }
    }
    return breadcrumbs;
  }

  ngOnInit() {
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    this.subscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.breadcrumbs = BreadcrumbComponent.filterBreadcrumbs(
          this.buildBreadcrumbs(this.activatedRoute.root));
      });
    this.subscription.add(routeDataStore.subscribe((newRoute) => {
      this.routeData = newRoute;
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Returns array of Breadcrumb objects that represent the breadcrumb trail.
   * Derived from current route in conjunction with the overall route structure.
   */
  private buildBreadcrumbs(route: ActivatedRoute, breadcrumbUrl: string = '', breadcrumbs: Breadcrumb[] = []): Array<Breadcrumb> {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }
    const [child] = children;
    const {snapshot: {routeConfig, url}} = child;
    if (!routeConfig.data || (!routeConfig.data.breadcrumb && !this.routeData)) {
      return this.buildBreadcrumbs(child, breadcrumbUrl, breadcrumbs);
    } else if (!routeConfig.data.breadcrumb && this.routeData && this.routeData.breadcrumb) {
        routeConfig.data = this.routeData;
    }
    const routeURL: string = url.map(segment => segment.path).join('/');
    if (routeURL.length > 0) {
      breadcrumbUrl += `/${routeURL}`;
    }
    const label = routeConfig.data.breadcrumb.value;
    const isIntermediate = routeConfig.data.breadcrumb.intermediate;

    if (!breadcrumbs.some(b => b.url === breadcrumbUrl)) {
      const breadcrumb = BreadcrumbComponent.makeBreadcrumb(label, isIntermediate, breadcrumbUrl, child);
      breadcrumbs.push(breadcrumb);
    }
    return this.buildBreadcrumbs(child, breadcrumbUrl, breadcrumbs);
  }

}
