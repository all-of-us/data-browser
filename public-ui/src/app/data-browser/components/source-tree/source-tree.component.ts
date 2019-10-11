import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-source-tree',
  template:
    `<app-recursive-tree
      [node]="rootNode" (conceptSelected)="bubbleUp($event)" [opened]="true"></app-recursive-tree>`,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent {
  @Input() rootNode: object;
  @Input() loading: boolean;
  @Output() conceptSelect: EventEmitter<any> = new EventEmitter;
  open = true;

  constructor() {
    this.rootNode = null;
  }

  public bubbleUp(concept) {
    this.conceptSelect.emit(concept);
  }



}
