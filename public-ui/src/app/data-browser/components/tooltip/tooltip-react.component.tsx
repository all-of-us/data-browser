import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { getTooltip } from 'app/data-browser/services/tooltip.service';
import { ClrIcon } from 'app/utils/clr-icon';
import { triggerEvent } from 'app/utils/google_analytics';
import * as React from 'react';

const containerElementName = 'root';

export const tooltipCss = `
.tooltip {
    position: relative;
    display: inline-block;

}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 300px;
    font-size: 14px;
    font-family: GothamBook, Arial, sans-serif;
    background-color: #FFFFFF;
    color: #302C71;
    text-align: left;
    border-spacing: 5px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 100%;
    left: 0%;
    margin-left: -140px;
    z-index: 110;
}

.tooltip .tooltiptext::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #302C71 transparent transparent transparent;
}

.tooltip:focus .tooltiptext, .tooltip:hover .tooltiptext {
    visibility: visible;
}

.tooltiptext {
    margin: 3%;
    line-height: normal;
    outline: 2px solid #302C71;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
`;

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
        console.log(this.props,'son');
        
  }

  render() {
    const tabIndex = 0;
    const iconShape = 'info-standard';
    const iconClass = 'is-solid info-icon';
    return <React.Fragment><style>{tooltipCss}</style><div tabIndex={tabIndex}
        className='tooltip' onFocus={() => this.tooltipHover()}
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
            </div></React.Fragment>;
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
