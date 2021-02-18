import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';
import {triggerEvent} from '../../../utils/google_analytics';
import { tooltips } from '../../services/tooltip.service';

const containerElementName = 'root';

interface Props {
  label: string;
  searchTerm: string;
  action: string;
  tooltipKey: string;
  shape: string;
  className: string;
}

interface State {
}

export class TooltipReactComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  tooltipHover() {
    triggerEvent('tooltipsHover', 'Tooltips', 'Hover', this.props.label, this.props.searchTerm, this.props.action);
  }

  render() {
    const tabIndex = 0;
    return <div tabIndex={tabIndex} className="tooltip" onFocus={() => this.tooltipHover()} onMouseEnter={() => this.tooltipHover()}>
                    <ClrIcon shape={this.props.shape} className={this.props.className} style={{width: 18, height: 18}} />
                    <span className="tooltiptext">
                    {
                        tooltips[this.props.tooltipKey]['texts'].map((tooltip, index) => {
                          if (index === 1 || index === 3) {
                            return <span className="allofus-italics" key={index}> {tooltip} </span>;
                          }  else {
                            return tooltip;
                          }
                        })
                    }
                    </span>
            </div>;
  }
}

const ClrIcon = ({className = '', ...props}) => {
  return React.createElement('clr-icon', {class: className, ...props});
};

@Component({
  selector: 'app-tooltip-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['./tooltip.component.css', '../../../styles/page.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TooltipWrapperComponent extends BaseReactWrapper {
  @Input() public label: string;
  @Input() public searchTerm: string;
  @Input() public action: string;
  @Input() public tooltipKey: string;
  @Input() public shape: string;
  @Input() public className: string;

  constructor() {
    super(TooltipReactComponent, ['label', 'searchTerm', 'action', 'tooltipKey', 'shape', 'className', 'onHover']);
  }
}
