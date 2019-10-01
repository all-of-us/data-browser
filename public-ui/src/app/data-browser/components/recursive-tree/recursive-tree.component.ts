import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { DataBrowserService } from '../../../../publicGenerated/api/dataBrowser.service';

@Component({
  selector: 'app-recursive-tree',
  templateUrl: './recursive-tree.component.html',
  styleUrls: ['./recursive-tree.component.css']
})
export class RecursiveTreeComponent implements OnChanges, OnDestroy {
  @Input() node: any;
  @Input() opened = false;
  @Input() loading = true;
  private subscriptions: ISubscription[] = [];
  constructor(private api: DataBrowserService) { }

  ngOnChanges() {
    if (this.node && this.node.group) {
      if (this.checkStorage(this.node)) {// if node exists in LS, use it.
        this.loading = true;
        this.node = JSON.parse(localStorage.getItem(this.node.code));
        this.loading = false;
        return;
      } else {// if not get it from database
        this.loading = true;
        setTimeout(() => {
          this.subscriptions.push(this.api.getCriteriaChildren(this.node.id)
            .subscribe({
              next: result => {
                if (result.items.length) {
                  this.node['children'] = result.items;
                  // built stash tree
                  localStorage.setItem(this.node.code, JSON.stringify(this.node));
                  this.loading = false;
                }
              }
            })
          );
        }, 50);
      }
    }
  }

  public checkStorage(node: any) {
    if (localStorage.getItem(node.code) !== null) {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

}
