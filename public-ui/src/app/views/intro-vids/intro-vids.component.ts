import { Component } from '@angular/core';

@Component({
  selector: 'app-intro-vids',
  templateUrl: './intro-vids.component.html',
  styleUrls: ['../../styles/template.css', './intro-vids.component.css']
})
export class IntroVidsComponent {

  videos = [{
    title: 'Participant Intro',
    downloadUrl: '',
    poster: '/assets/videos/video_poster.png',
    src: [{
      url: '',
      type: 'video/mp4'
    },
    {
      url: '',
      type: 'video/ogg'
    },
    {
      url: '',
      type: 'video/webm'
    }],
  },
  {
    title: 'Researcher Intro',
    downloadUrl: '',
    poster: '/assets/videos/video_poster.png',
    src: [{
      url: '',
      type: 'video/mp4'
    },
    {
      url: '',
      type: 'video/ogg'
    },
    {
      url: '',
      type: 'video/webm'
    }],
  }];

}
