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

const ReactButtonComponent =
    (props) => {
        return <button onClick={props.handleClick} className={props.styleClass}>
        {props.title}</button>;
    };

@Component({
  selector: 'app-react-button',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['../../../styles/page.css', '../../../styles/buttons.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ReactButtonWrapperComponent extends BaseReactWrapper {
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
    const {handleClick} = this;
    ReactDOM.render( <ReactButtonComponent title={title} styleClass={styleClass}
    handleClick={handleClick}/>,
    this.containerRef.nativeElement);
  }
}
