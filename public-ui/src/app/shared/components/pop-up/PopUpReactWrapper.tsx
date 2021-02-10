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
import { PopUpReactComponent } from './PopUpReactComponent';
import { FunctionComponent } from 'react';
const containerElementName = 'myReactComponentContainer';

@Component({
  selector: 'app-popup-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['../../../styles/template.css', './pop-up.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class PopUpReactWrapperComponent extends BaseReactWrapper {
  @ViewChild(containerElementName, { static: true }) containerRef: ElementRef;
  @Input() public title = 'test title';
  @Input() public statement;
  @Output() public close = new EventEmitter<void>();

  constructor(public injector: Injector) {
    super(injector);
    this.closeClick = this.closeClick.bind(this);
  }

  public closeClick() {
      if (this.close) {
        this.close.emit();
        this.render();
      }
    }

  public render() {
    const {title} = this;
    const {statement} = this;
    ReactDOM.render( <PopUpReactComponent title={title} statement={statement} onClick={this.closeClick}/>,
    this.containerRef.nativeElement);
  }
}