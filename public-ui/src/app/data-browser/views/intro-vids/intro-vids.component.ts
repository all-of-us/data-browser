import { Component } from '@angular/core';
import { VideoService } from 'app/data-browser/services/video.service';
@Component({
  selector: 'app-intro-vids',
  styleUrls: ['../../../styles/template.css', './intro-vids.component.css'],
  templateUrl: './intro-vids.component.html'
})

export class IntroVidsComponent {
  videos: any[];
  constructor(private videoService: VideoService) {
    this.videos = this.videoService.videos;
  }
}
