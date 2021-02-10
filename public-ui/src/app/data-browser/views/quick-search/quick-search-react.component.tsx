import {
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';

import { FunctionComponent } from 'react';
import { Video, VideoService } from '../../services/video.service';
const containerElementName = 'myReactComponentContainer';

const ResultLinksComponent: FunctionComponent =
    (props): any => {
        return <React.Fragment>
            </React.Fragment>;
    };

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-db-home',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../../styles/template.css', './quick-search.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class DbHomeWrapperComponent extends BaseReactWrapper {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;
    video: Video;
    videos: Video[];

    constructor( public injector: Injector) {
        super(injector);
    }

    public render() {
       return ReactDOM.render(
            <React.Fragment>
                <ResultLinksComponent />
            </React.Fragment>, this.containerRef.nativeElement);
    }
}




