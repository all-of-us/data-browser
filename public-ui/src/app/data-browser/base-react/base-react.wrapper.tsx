import {
    AfterViewInit,
    Component,
    ElementRef,
    Injector,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as fp from 'lodash/fp';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
const containerElementName = 'myReactComponentContainer';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'base-react-wrapper',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../styles/template.css'],
    encapsulation: ViewEncapsulation.None,
})
  // tslint:disable-next-line: component-class-suffix
export class BaseReactWrapper implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;

    constructor(public injector: Injector, private WrappedComponent: React.ComponentType, private propNames: string[]) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.render();
    }

    ngAfterViewInit(): void {
        this.render();
    }

    ngOnDestroy(): void {
        ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }

    render(): void {
        const {WrappedComponent, propNames} = this;
        ReactDOM.render(
          <WrappedComponent {...fp.fromPairs(propNames.map(name => [name, this[name]]))} />,
          this.containerRef.nativeElement
        );
      }
}


