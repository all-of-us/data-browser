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
    console.log(this.opened, this.node);

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
  openUp(i, node, nodes) {
    this.childIndex = nodes.findIndex(x => x);
    if (i === this.childIndex) {
      this.subOpened = !this.subOpened;
    }
  }

}
