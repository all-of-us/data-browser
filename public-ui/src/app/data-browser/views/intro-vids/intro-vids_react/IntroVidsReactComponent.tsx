import * as React from 'react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {Video} from '../../../services/video.service'


export const IntroVidReactComponent: FunctionComponent<Video> =
    (props) => {
        console.log('IntroVidReactComponent');     
        return <span>
            <h2 className="secondary-display">{props.title}</h2>
            <div className="vid-container">
                <video poster={props.poster} controls >
                    {
                        props.src.map((source) => {
                            return <source key={source.url} src={source.url} type={source.type} />
                        })
                    }
                    {
                        props.subtitles.map((sub) => {
                            return <track key={sub.label} default={sub.default} label={sub.label} kind='subtitles' lang={sub.lang} src={sub.url}></track>
                        })
                    }
                     Sorry, your browser doesn't support embedded videos,
                     but don't worry, you can <a href={props.downloadUrl}>download it</a>
                     and watch it with your favorite video player!
                </video>
            </div>
        </span>
    };
