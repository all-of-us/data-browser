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
import{ ClrIcon } from '../../../utils/clr-icon';
import { triggerEvent } from '../../../utils/google_analytics';
import { getTooltip, tooltips } from '../../services/tooltip.service';

const containerElementName = 'root';

interface Props {
  label: string;
  searchTerm: string;
  action: string;
  tooltipKey: string;
}

export class TooltipReactComponent extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);
  }

  tooltipHover() {
    triggerEvent('tooltipsHover', 'Tooltips', 'Hover', this.props.label,
        this.props.searchTerm, this.props.action);
  }

  render() {
    const tabIndex = 0;
    const iconShape = 'info-standard';
    const iconClass = 'is-solid info-icon';
    return <div tabIndex={tabIndex} className='tooltip' onFocus={() => this.tooltipHover()}
        onMouseEnter={() => this.tooltipHover()}>
            <ClrIcon shape={iconShape} className={iconClass}
                style={{width: 18, height: 18}} />
                <span className='tooltiptext'>
                    {
                        getTooltip(this.props.tooltipKey).map((tooltip, index) => {
                          if (index === 1 || index === 3) {
                            return <span className='allofus-italics' key={index}> {tooltip} </span>;
                          }  else {
                            return tooltip;
                          }
                        })
                    }
                    </span>
            </div>;
  }
}

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

  constructor() {
    super(TooltipReactComponent, ['label', 'searchTerm', 'action', 'tooltipKey', 'onHover']);
  }
}
