import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { DataBrowserService } from '../../../publicGenerated/api/dataBrowser.service';

@Component({
  selector: 'app-recursive-tree',
  templateUrl: './recursive-tree.component.html',
  styleUrls: ['./recursive-tree.component.css']
})
export class RecursiveTreeComponent implements OnChanges, OnDestroy {
  @Input() node: any;
  @Input() opened: boolean;
  @Input() childIndex: number;
  loading = true;
  subOpened = false;
  private subscriptions: ISubscription[] = [];
  constructor(private api: DataBrowserService) { }

  ngOnChanges() {
    if (this.node && this.node.group) {
      this.subscriptions.push(this.api.getCriteriaChildren(this.node.id)
        .subscribe({
          next: result => {
            if (result.items.length) {
              this.node['children'] = result.items;
              this.loading = false;
            }
          }
        })
      );
    }
  }
  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }
  openUp(index, node, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      if (item === node && i === index) {
        this.childIndex = i;
        this.subOpened = !this.subOpened;
      }
    }
  }
}
