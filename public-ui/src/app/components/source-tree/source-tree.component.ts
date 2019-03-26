import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';


@Component({
  selector: 'app-source-tree',
  // templateUrl: './source-tree.component.html',
  template:
    `<app-recursive-tree
      [node]="rootNode"
      [selectedNode]="selectedNode"
      (select) = "selectEvents.emit($event);"></app-recursive-tree>
  `,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent implements OnChanges {
  @Input() rootNode: object;
  @Input() selectedNode: any;
  @Output() selectEvents = new EventEmitter<any>();
  open = true;

  constructor() {
    this.rootNode = null;
    this.selectedNode = null;
    this.selectEvents = new EventEmitter();
  }

  ngOnChanges() {
  }



}
