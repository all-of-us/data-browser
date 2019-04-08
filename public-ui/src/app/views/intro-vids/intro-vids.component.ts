import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-intro-vids',
  templateUrl: './intro-vids.component.html',
  styleUrls: ['../../styles/template.css', './intro-vids.component.css']
})
export class IntroVidsComponent implements OnInit {

  videos = [{
    title: 'Participant Intro',
    src: [{
      url: '/assets/videos/big_buck_bunny.mp4',
      type: 'video/mp4'
    },
    {
      url: '/assets/videos/big_buck_bunny.ogv',
      type: 'video/ogg'
    },
    {
      url: '/assets/videos/big_buck_bunny.webm',
      type: 'video/webm'
    }]
  },
  {
    title: 'Researcher Intro',
    src: [{
      url: '/assets/videos/big_buck_bunny.mp4',
      type: 'video/mp4'
    },
    {
      url: '/assets/videos/big_buck_bunny.ogv',
      type: 'video/ogg'
    },
    {
      url: '/assets/videos/big_buck_bunny.webm',
      type: 'video/webm'
    }]
  },
  ];
  constructor() { }

  ngOnInit() {
  }

}
