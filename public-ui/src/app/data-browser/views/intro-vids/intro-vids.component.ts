import { Component } from '@angular/core';
import { environment } from 'environments/environment';
import { VideoService } from '../../services/video.service';
@Component({
  selector: 'app-intro-vids',
  styleUrls: ['../../../styles/template.css', './intro-vids.component.css'],
  template: /* if */ environment.testReact ?
    '<react-intro-vids></react-intro-vids>' : /* else */
    `<div class="db-container">
    <h1 class="primary-display">Introductory Videos</h1>
    <ng-container *ngFor="let video of videos">
      <h2 class="secondary-display">{{video.title}}</h2>
      <div class="vid-container">
        <video poster="{{video.poster}}"controls >
          <ng-container *ngFor='let src of video.src'>
            <source src="{{src.url}}" type="{{src.type}}" />
          </ng-container>
          <ng-container *ngFor='let sub of video.subtitles'>
            <track default={{sub.default}} label="{{sub.label}}" kind="subtitles" srclang="{{sub.lang}}" src="{{sub.url}}" >
          </ng-container>
            Sorry, your browser doesn't support embedded videos,
            but don't worry, you can <a href="{{video.downloadUrl}}">download it</a>
            and watch it with your favorite video player!
        </video>
      </div>
    </ng-container>
  </div>`
})
export class IntroVidsComponent {
  videos: any[];
  constructor(private videoService: VideoService) {
    this.videos = this.videoService.videos;
  }

}
