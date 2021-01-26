import {
    AfterViewInit,
    Component,
    ElementRef,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
const containerElementName = 'myReactComponentContainer';

import { ReactComponent } from './react.component';


@Component({
    selector: 'react-name',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../styles/template.css', './react.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class WrapperComponent implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;

    prop = {text:'sup'};
    
    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.render();
    }

    ngAfterViewInit() {
        this.render();
    }

    ngOnDestroy() {
        ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }

    private render() {
        ReactDOM.render( 
                <span><ReactComponent {...this.prop}  /></span>, this.containerRef.nativeElement);
    }
}

