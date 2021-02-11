import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';

const containerElementName = 'myReactComponentContainer';

const TooltipReactComponent =
    (props) => {
        const tabIndex = 0;
        const toolTipHtml = ['<span className=\"tooltiptext\">'];
        for (var i = 0; i < props.tooltips.length; i++) {
            toolTipHtml.push(props.tooltips[i]);
            if ( i== 1 || i == 3) {
                toolTipHtml.push('</span>');
            }
            if (i == 0 || i == 2) {
                toolTipHtml.push('<span className=\"allofus-italics\">');
            }
        }
        toolTipHtml.push('</span>');
        const toolTipHtmlText = toolTipHtml.join('');
        return <div tabIndex={tabIndex} className="tooltip" onFocus={props.onFocus} onMouseEnter={props.onMouseEnter}>
                <ClrIcon shape={props.shape} className={props.className} style={{width: 18, height: 18}} />
                <span className="tooltiptext">
                {
                    props.tooltips.map((tooltip, index) => {
                      if (index === 1 || index === 3) {
                        return <span className="allofus-italics" key={index}> {tooltip} </span>;
                      }  else {
                        return tooltip;
                      }
                    })
                }
                </span>
        </div>;
    };

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
  @ViewChild(containerElementName, { static: true }) containerRef: ElementRef;
  @Input() public label: string;
  @Input() public searchTerm: string;
  @Input() public action: string;
  @Input() public tooltips: string[];
  @Input() public shape: string;
  @Input() public className: string;

  constructor(public injector: Injector) {
    super(injector);
  }

  public hoverOnTooltip() {
    console.log('Hover');
  }

  public render() {
    ReactDOM.render( <TooltipReactComponent tooltips={this.tooltips} shape={this.shape} className={this.className} onFocus={this.hoverOnTooltip} onMouseEnter={this.hoverOnTooltip}/>,
    this.containerRef.nativeElement);
  }
}