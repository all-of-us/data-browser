import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import * as fp from "lodash/fp";

import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnChanges,
  OnDestroy,
  ViewChild,
} from "@angular/core";

// Add empty directive decorator to base class per Angular docs:
// https://angular.io/guide/migration-undecorated-classes
@Directive()
// tslint:disable-next-line: directive-class-suffix
export class BaseReactWrapper implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild("root") containerRef: ElementRef;
  initialized = false;
  private root: Root | null = null;

  constructor(
    private WrappedComponent: React.ComponentType,
    private propNames: string[]
  ) {}

  ngOnChanges(): void {
    // If not initialized, don't render. Prevents error caused by containerRef being undefined
    if (this.initialized) {
      this.render();
    }
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    this.root = createRoot(this.containerRef.nativeElement);
    this.render();
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  render() {
    const { WrappedComponent, propNames } = this;
    if (this.root) {
      this.root.render(
        <WrappedComponent
          {...fp.fromPairs(propNames.map((name) => [name, this[name]]))}
        />
      );
    }
  }
}
