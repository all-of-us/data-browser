import { Component as AComponent } from '@angular/core';
import * as React from 'react';

import { AppRoute, AppRouter } from 'app/components/app-router';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { FitbitReactComponent } from 'app/data-browser/views/fitbit-view/fitbit-view-react.component';
import { IntroVidReactComponent } from 'app/data-browser/views/intro-vids/intro-vids-react.component';
import { PMReactComponent } from 'app/data-browser/views/pm/pm-react.component';
import { dBHomeComponent } from 'app/data-browser/views/quick-search/home-view-react.component'
import { EhrViewReactComponent } from 'app/data-browser/views/ehr-view/ehr-view-react.component'

export const AppRoutingComponent: React.FunctionComponent = () => {

  return <AppRouter>
    <AppRoute
      path='/'
      component={() => dBHomeComponent(
        {
          routeData: {
            title: 'Data Browser',
            breadcrumb: { value: '' }
          }
        })}
    />
    <AppRoute
      path='/:id'
      component={() => dBHomeComponent(
        {
          routeData: {
            title: 'Data Browser',
            breadcrumb: { value: '' }
          }
        })}
    />
    <AppRoute
      path='/introductory-videos'
      component={() => IntroVidReactComponent(
        {
          routeData: {
            title: 'Introductory Videos',
            breadcrumb: { value: 'Introductory Videos' }
          }
        })}
    />
    <AppRoute
      path='/ehr/:id'
      component={() => EhrViewReactComponent(
        {
          routeData: {
            title: 'Physical Measurements',
            breadcrumb: { value: 'physical measurements' }
          }
        })}
    />
    <AppRoute
      path='/fitbit'
      component={() => FitbitReactComponent(
        {
          routeData: {
            title: 'Fitbit Data',
            breadcrumb: { value: 'Fitbit Data' }
          }
        })}
    />
    <AppRoute
      path='/fitbit/:search'
      component={() => FitbitReactComponent(
        {
          routeData: {
            title: 'Fitbit Data',
            breadcrumb: { value: 'Fitbit Data' }
          }
        })}
    />
    <AppRoute
      path='/physical-measurements'
      component={() => PMReactComponent(
        {
          routeData: {
            title: 'Physical Measurements',
            breadcrumb: { value: 'physical measurements' }
          }
        })}
    />
    <AppRoute
      path='/physical-measurements/:search'
      component={() => PMReactComponent(
        {
          routeData: {
            title: 'Physical Measurements',
            breadcrumb: { value: 'physical measurements' }
          }
        })}
    />
  </AppRouter>;

};

@AComponent({
  template: '<div #root style="display: inline;"></div>'
})
export class AppRouting extends BaseReactWrapper {
  constructor() {
    super(AppRoutingComponent, []);
  }
}
