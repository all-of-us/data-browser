import { Component, Input, OnChanges } from '@angular/core';


@Component({
  selector: 'app-source-tree',
  template:
    `<app-db-spinner [loading]="loading" [dots]="true"></app-db-spinner>
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
