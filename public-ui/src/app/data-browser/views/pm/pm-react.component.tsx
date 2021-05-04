import { Component } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { FunctionComponent } from 'react';

import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';

const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

interface State {
}

interface Props {
}

export class pmReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  render() {
      return <div>
        PM React Test
      </div>;
    }
}



@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-pm',
    template: `<span #root></span>`,
})

export class PhysicalMeasurementsWrapperComponent extends BaseReactWrapper {
    constructor() {
        super(pmReactComponent, []);
    }
}
