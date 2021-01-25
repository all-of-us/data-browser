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
import { IntroVidReactComponent } from './IntroVidsReactComponent';
import { Video, VideoService } from '../../../services/video.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-intro-vids',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../../../styles/template.css', '../intro-vids.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class IntroVidsWrapperComponent implements OnChanges, OnDestroy, AfterViewInit {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;
    video: Video;
    videos: Video[];

    constructor(public vidService: VideoService) {
        this.videos = this.vidService.videos;
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
            <span>
                <div className='db-container'>
                    <h1 className='primary-display'>Introductory Videos</h1>
                    {
                        this.videos.map((video: Video, index) => {
                            const key = 'video' + index;
                            return <span key={key}> <IntroVidReactComponent {...video} /></span>;
                        })
                    }
                </div>
            </span>, this.containerRef.nativeElement);
    }
}

