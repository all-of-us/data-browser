
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { TreeHighlightService } from 'app/data-browser/services/tree-highlight.service';
import { DataBrowserService } from 'publicGenerated';
import { Subscription as ISubscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-recursive-tree',
  templateUrl: './recursive-tree.component.html',
  styleUrls: ['./recursive-tree.component.css']
})
export class RecursiveTreeComponent implements OnChanges, OnDestroy {
  @Input() node: any;
  @Input() opened = false;
  @Input() loading: boolean;
  @Output() conceptSelected: EventEmitter<any> = new EventEmitter;
  highlightId: string;
  private subscriptions: ISubscription[] = [];
  constructor(private api: DataBrowserService, public highlightService: TreeHighlightService) { }

  ngOnChanges() {
    if (this.node && this.node.group) {
      this.loading = true;
      // get it from database
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

  public conceptClick(node: any) {
    localStorage.setItem('treeHighlight', node.id);
    this.conceptSelected.emit(node);
  }

  ngOnDestroy() {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

}
