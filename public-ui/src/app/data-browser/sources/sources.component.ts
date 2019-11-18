import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DataBrowserService } from 'publicGenerated';
import { Concept } from '../../../publicGenerated';
import { TooltipService } from '../../utils/tooltip.service';
@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['../../styles/template.css', './sources.component.css']
})
export class SourcesComponent implements OnChanges {
  @Input() concept: Concept;
  @Input() treeLoading: boolean;
  @Input() treeData: any[];
  @Input() graphToShow: string;
  @Input() ehrDomain: any;
  @Output() exploreConcept: EventEmitter<any> = new EventEmitter();
  treeConcept: any;

  constructor(
    public tooltipText: TooltipService,
    private api: DataBrowserService) { }

  ngOnChanges() {
  }

  public conceptTreeClick(node) {
    this.api.getSourceConcepts(node.conceptId).subscribe(results => {
      this.treeConcept = {};
      if (!results.items[0]) {
        this.treeConcept['conceptName'] = node.name;
        this.treeConcept['conceptCode'] = node.code;
        this.treeConcept['conceptId'] = node.conceptId;
        this.treeConcept['explorable'] = false;
        this.treeConcept['domainId'] = this.ehrDomain.domain;
      } else if (results.items[0]['canSelect'] === 0) {
        this.treeConcept = results.items[0];
        this.treeConcept['explorable'] = false;
      } else {
        this.treeConcept = results.items[0];
        this.treeConcept['explorable'] = true;
      }
    });
  }
}
