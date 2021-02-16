import {
    AfterViewInit,
    Directive,
    ElementRef,
    OnChanges,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import * as fp from 'lodash/fp';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Add empty directive decorator to base class per Angular docs:
// https://angular.io/guide/migration-undecorated-classes
@Directive()
// tslint:disable-next-line: directive-class-suffix
export class BaseReactWrapper implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild('root') containerRef: ElementRef;
    initialized = false;
    
    constructor(private WrappedComponent: React.ComponentType, private propNames: string[]) {}

    ngOnChanges(): void {
        // If not initialized, don't render. Prevents error caused by containerRef being undefined
        if (this.initialized) {
            this.render();
        }
    }

    ngAfterViewInit(): void {
        this.initialized = true;
        this.render();
    }

    ngOnDestroy(): void {
        ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
    }

    render() {
        const {WrappedComponent, propNames} = this;
        ReactDOM.render(
          <WrappedComponent {...fp.fromPairs(propNames.map(name => [name, this[name]]))}/>,
          this.containerRef.nativeElement
        );
    }
}
