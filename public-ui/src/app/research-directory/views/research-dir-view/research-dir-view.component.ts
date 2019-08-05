import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-research-dir-view',
  templateUrl: './research-dir-view.component.html',
  styleUrls: ['./research-dir-view.component.css', '../../../styles/template.css']
})
export class ResearchDirViewComponent implements OnInit {
  itemList: any[];
  constructor() { }

  ngOnInit() {
    this.itemList =
      [{
        title: 'Workspaces',
        subInfo: '42'
      },
      {
        title: 'Researchers',
        subInfo: '234'
      }];
  }

}
