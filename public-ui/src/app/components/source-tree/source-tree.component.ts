import { Component, Input, OnChanges } from '@angular/core';


@Component({
  selector: 'app-source-tree',
  template:
    `<div *ngIf="loading" class="loading-dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <app-recursive-tree *ngIf="!loading"
      [node]="rootNode"></app-recursive-tree>
  `,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent implements OnChanges {
  @Input() rootNode: object;
  @Input() loading = true;
  open = true;

  constructor() {
  }

  ngOnChanges() {
  }



}
