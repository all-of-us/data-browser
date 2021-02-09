import {
    AfterViewInit,
    ElementRef,
    Injector,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import * as ReactDOM from 'react-dom';
const containerElementName = 'myReactComponentContainer';


// tslint:disable-next-line: component-class-suffix
export class BaseReactWrapper implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;

    constructor(public injector: Injector) { }

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

