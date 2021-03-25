import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

interface Props {
    dataType: string;
}

export class ErrorMessageReactComponent extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    const {dataType} = this.props;
    const iconClass = 'alert-icon';
    const iconShape = 'exclamation-triangle';
    const alertText =  (dataType === 'data') ? '<span className="alert-text"></span>' : '<span className="alert-text">' +
                                'Sorry, the chart cannot be displayed. Please try refreshing the page.' +
                              '</span>';
    return <div className='alert alert-box'>
      <div className='alert-items'>
        <div className='alert-item static'>
          <div className='alert-icon-wrapper'>
            <ClrIcon shape={iconShape} className={iconClass}
                            style={{width: 26, height: 26}} />
          </div>
          <span className='alert-text'>
          {dataType === 'data' ? 'Sorry, the data are currently unavailable. Please try refreshing the page or returning home <a [routerLink]="[\'\']">here.</a>'
          : 'Sorry, the chart cannot be displayed. Please try refreshing the page.'}</span>
        </div>
      </div>
    </div>;
  }
}

@Component({
  selector: 'app-error-message-react',
  template: `<span #root></span>`,
  styleUrls: ['./error-message.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ErrorMessageWrapperComponent extends BaseReactWrapper {
  @Input() public dataType: string;

  constructor() {
    super(ErrorMessageReactComponent, ['dataType']);
  }
}
