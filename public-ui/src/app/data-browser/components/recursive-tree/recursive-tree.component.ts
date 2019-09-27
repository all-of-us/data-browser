import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
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
  @Output() payload: EventEmitter<any> = new EventEmitter();
  private subscriptions: ISubscription[] = [];
  constructor(private api: DataBrowserService) { }

  ngOnChanges() {
    if (this.node && this.node.group) {
      this.emitChild(this.node);
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
      }, 10);
      }
  }

  public checkStorage(node: any) {
    if (localStorage.getItem(node.code) === null) {
      return true;
    }
    return false;
  }
  public emitChild(child) {
    console.log(child,"recursive child");
    
    this.payload.emit(child);
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

}
