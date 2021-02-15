import {
    Component,
    ElementRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';

import { FunctionComponent } from 'react';
import { Video, VideoService } from '../../services/video.service';
const containerElementName = 'myReactComponentContainer';

const IntroVidReactComponent: FunctionComponent<Video> =
    (props) => {
        return <span>
            <h2 className='secondary-display'>{props.title}</h2>
            <div className='vid-container'>
                <video poster={props.poster} controls >
                    {
                        props.src.map((source) => {
                            return <source key={source.url} src={source.url} type={source.type} />;
                        })
                    }
                    {
                        props.subtitles.map((sub) => {
                            return <track
                                key={sub.label} default={sub.default} label={sub.label}
                                lang={sub.lang} src={sub.url}></track>;
                        })
                    }
                    Sorry, your browser doesn't support embedded videos,
                     but don't worry, you can <a href={props.downloadUrl}>
                        download this video here</a>
                    and watch it with your favorite video player!
                </video>
            </div>
        </span>;
    };

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-intro-vids',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../../styles/template.css', './intro-vids.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class IntroVidsWrapperComponent extends BaseReactWrapper {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;
    video: Video;
    videos: Video[];

    constructor(public vidService: VideoService) {
        super(IntroVidReactComponent, []);
        this.videos = this.vidService.videos;
    }

    public render() {
        ReactDOM.render(
            <React.Fragment>
                <div className='db-container' >
                    <h1 className='primary-display' > Introductory Videos </h1>
                    {
                        this.videos.map((video: Video, index) => {
                            const key = 'video' + index;
                            return <span key={key}>
                                <IntroVidReactComponent {...video} /> </span>;
                        })
                    }
                </div>
            </React.Fragment>, this.containerRef.nativeElement);
    }
}
