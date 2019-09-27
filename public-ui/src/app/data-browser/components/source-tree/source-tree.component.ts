import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-source-tree',
  template:
    `<app-recursive-tree
      [node]="rootNode" (payload)="bubbleUp($event)" [opened]="true"></app-recursive-tree>`,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent {
  @Input() rootNode: object;
  @Input() loading: boolean;
  @Output() payload: EventEmitter<any> = new EventEmitter();
  open = true;

  constructor() {
    this.rootNode = null;
  }

  public bubbleUp(e) {
    this.payload.emit(e);
  }




}
