import {Component as AComponent} from '@angular/core';
import * as React from 'react';

import {AppRoute, AppRouter} from 'app/components/app-router';
import {BaseReactWrapper} from 'app/data-browser/base-react/base-react.wrapper';
import {IntroVidReactComponent} from './data-browser/views/intro-vids/intro-vids-react.component';

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
