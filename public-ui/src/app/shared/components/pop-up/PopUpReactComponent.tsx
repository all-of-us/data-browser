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

const PopUpReactComponent =
    (props) => {
    return <div className='data-statement'>
            <div className='card'>
                <div onClick={props.closeClick} className='close'>x</div>
                   <h2 className='card-title'>{props.title}</h2>
                   <div className='card-body' dangerouslySetInnerHTML=
                    {{ __html: props.statement }}></div>
                   <div className='btn-container'>
                  <button onClick={props.closeClick} className='disclaimer-btn'>OK</button>
                  </div>
                </div>
          </div>;
    }

@Component({
  selector: 'app-popup-react',
  template: `<span #${containerElementName}></span>`,
  styleUrls: ['../../../styles/template.css', './pop-up.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class PopUpWrapper extends BaseReactWrapper {
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
    const {closeClick} = this;
    ReactDOM.render(
        <PopUpReactComponent title={title} statement={statement} closeClick={closeClick}/>,
        this.containerRef.nativeElement);
  }
}
