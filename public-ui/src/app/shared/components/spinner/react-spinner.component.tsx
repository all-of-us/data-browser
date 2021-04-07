import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import * as React from 'react';

const SpinnerReactComponent: React.FunctionComponent<{loading: boolean, dots: boolean}> =
  ({loading, dots}) => {
  return <React.Fragment>
  {loading && !dots ?
    <div className="spinner-container">
        <span className="spinner"></span>
    </div>
  : [
    loading && dots ?
        <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            </div> : null
    ]}
    </React.Fragment>;
};

@Component({
  selector: 'app-spinner-react',
  template: `<span #root></span>`,
  styleUrls: ['./spinner.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class SpinnerWrapperComponent extends BaseReactWrapper {
  @Input() public loading: boolean;
  @Input() public dots: boolean;

  constructor() {
    super(SpinnerReactComponent, ['loading', 'dots']);
  }
}
