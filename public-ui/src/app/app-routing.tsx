import {Component as AComponent} from '@angular/core';
import * as React from 'react';

import {AppRoute, AppRouter} from 'app/components/app-router';
import {BaseReactWrapper} from 'app/data-browser/base-react/base-react.wrapper';

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
