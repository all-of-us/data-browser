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
import { FunctionComponent } from 'react';
import { PopUpReactComponent } from './PopUpReactComponent';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';
const containerElementName = 'myReactComponentContainer';

@Component({
  selector: 'popup-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['../../../styles/template.css', './pop-up.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopUpReactWrapper extends BaseReactWrapper {
  @ViewChild(containerElementName, { static: true }) containerRef: ElementRef;
  @Input() public title = 'test title';
  @Input() public statement;
  @Output() public close = new EventEmitter<void>();

  constructor(public injector: Injector) {
    super(injector);
    this.handleDivClicked = this.handleDivClicked.bind(this);
  }

  public handleDivClicked() {
      if (this.close) {
        this.close.emit();
        this.render();
      }
    }

  public render() {
    const {title} = this;
    const {statement} = this;
    ReactDOM.render( <PopUpReactComponent title={title} statement={statement} onClick={this.handleDivClicked}/>, this.containerRef.nativeElement);
  }
}