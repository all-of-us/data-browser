import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';

import { FunctionComponent } from 'react';
import { Video, videos } from '../../services/video.service';

const IntroVidReactComponent: FunctionComponent<Video> = () => <div className='db-container'>
    <h1 className='primary-display'> Introductory Videos </h1>
    {videos.map((video: Video, index) => <span key={index}>
        <h2 className='secondary-display'>{video.title}</h2>
        <div className='vid-container'>
            <video poster={video.poster} controls>
                {video.src.map((source) => <source key={source.url}
                                                   src={source.url}
                                                   type={source.type}/>)
                }
                {video.subtitles.map((sub) => <track key={sub.label}
                                                     default={sub.default}
                                                     label={sub.label}
                                                     lang={sub.lang}
                                                     src={sub.url}/>)
                }
                Sorry, your browser doesn't support embedded videos,
                 but don't worry, you can <a href={video.downloadUrl}>
                    download this video here</a>
                and watch it with your favorite video player!
            </video>
        </div>
     </span>)}
</div>;

@Component({
    // tslint:disable-next-line: component-selector
    template: `<div #root></div>`,
    styleUrls: ['../../../styles/template.css', './intro-vids.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class IntroVidsWrapperComponent extends BaseReactWrapper {
    constructor() {
        super(IntroVidReactComponent, []);
    }
}