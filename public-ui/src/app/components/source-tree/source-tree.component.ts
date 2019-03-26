import { Component, Input, OnChanges } from '@angular/core';


@Component({
  selector: 'app-source-tree',
  template:
    `<app-recursive-tree
      [node]="rootNode"></app-recursive-tree>
  `,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent implements OnChanges {
  @Input() rootNode: object;
  open = true;

  constructor() {
    this.rootNode = null;
  }

  ngOnChanges() {
  }



}
