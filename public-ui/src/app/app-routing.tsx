import {Component as AComponent} from '@angular/core';
import * as fp from 'lodash/fp';
import * as React from 'react';
import {Redirect} from 'react-router-dom';

import {AppRoute, AppRouter, withFullHeight, withRouteData} from 'app/components/app-router';
import {BaseReactWrapper} from 'app/data-browser/base-react/base-react.wrapper';
import {BreadcrumbType} from 'app/utils/navigation';

export const AppRoutingComponent: React.FunctionComponent<{}> = () => {
  return <AppRouter>
    <AppRoute
      path=''
      component={() => {}}
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
