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
import * as React from 'react';
import * as ReactDOM from 'react-dom';
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

    constructor(public injector: Injector) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.render();
    }

    ngAfterViewInit(): void {
        this.render();
    }

    ngOnDestroy(): void {
        ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }

    render() {
        // this will be overwritten by the extended wrapper
    }
}
