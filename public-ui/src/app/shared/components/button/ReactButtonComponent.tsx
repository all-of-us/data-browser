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
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';
import { FunctionComponent } from 'react';

const containerElementName = 'myReactComponentContainer';

@Component({
  selector: 'app-react-button',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['../../../styles/page.css', '../../../styles/buttons.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ReactButtonComponent extends BaseReactWrapper {
  @ViewChild(containerElementName, { static: true }) containerRef: ElementRef;
  @Input() public title;
  @Input() public styleClass;
  @Output() public click = new EventEmitter<void>();

  constructor(public injector: Injector) {
    super(injector);
    this.handleClick = this.handleClick.bind(this);
  }

  public handleClick() {
      if (this.click) {
        this.click.emit();
        this.render();
      }
    }

  public render() {
    const {title} = this;
    const {styleClass} = this;
    ReactDOM.render( <button onClick={this.handleClick} className={styleClass}>{title}</button>,
    this.containerRef.nativeElement);
  }
}
