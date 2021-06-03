import {Component as AComponent} from '@angular/core';
import * as React from 'react';

import {AppRoute, AppRouter, withRouteData} from 'app/components/app-router';
import {BaseReactWrapper} from 'app/data-browser/base-react/base-react.wrapper';
import {IntroVidReactComponent} from './data-browser/views/intro-vids/intro-vids-react.component';
import {SurveyViewReactComponent} from 'app/data-browser/views/survey-view/survey-react-view.component';

const SurveyViewPage = withRouteData(SurveyViewReactComponent);

export const AppRoutingComponent: React.FunctionComponent = () => {
  return <AppRouter>
    <AppRoute
      path='/introductory-videos'
      component={() => IntroVidReactComponent(
        {routeData: {
            title: 'Introductory Videos',
            breadcrumb: {value: 'Introductory Videos'}
          }})}
    />
    <AppRoute
      path='/survey/:id/'
      component={() => SurveyViewPage(
        {routeData: {
            title: 'View Survey Questions and Answers',
            breadcrumb: {value: ':id survey'}
          }})}
    />
    <AppRoute
      path='/survey/:id/:search'
      component={() => SurveyViewPage(
        {routeData: {
            title: 'View Survey Questions and Answers',
            breadcrumb: {value: ':id survey'}
          }})}
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
