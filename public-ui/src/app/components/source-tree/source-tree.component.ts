import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-source-tree',
  template:
    `<app-recursive-tree
      [node]="rootNode" [opened]="true"></app-recursive-tree>`,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent {
  @Input() rootNode: object;
  @Input() loading: boolean;
  open = true;

  constructor() {
    this.rootNode = null;
  }




}
