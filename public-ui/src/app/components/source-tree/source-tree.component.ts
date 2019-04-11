import { Component, Input, OnChanges } from '@angular/core';


@Component({
  selector: 'app-source-tree',
  template:
    `<app-db-spinner [loading]="loading" [dots]="true"></app-db-spinner>
    <span class="tree-row"
    [ngClass]="[rootNode.group ? 'hasChildren':'noChildren' , opened ? 'opened':'']"
    (click)="opened=!opened"><span>{{rootNode.name}}</span> <span class="blue-text">
    ({{rootNode.count | number}})</span></span>
    <app-recursive-tree *ngIf="!loading" [opened]="opened" [node]="rootNode"></app-recursive-tree>
  `,
  styleUrls: ['./source-tree.component.css']
})
export class SourceTreeComponent {
  @Input() rootNode: object;
  @Input() loading = true;
  opened = false;
}
