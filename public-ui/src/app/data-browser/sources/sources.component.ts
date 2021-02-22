import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataBrowserService } from 'publicGenerated';
import { environment } from '../../../environments/environment';
import { Concept } from '../../../publicGenerated';
import { TooltipService } from '../services/tooltip.service';
@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['../../styles/template.css', './sources.component.css']
})
export class SourcesComponent {
  @Input() concept: Concept;
  @Input() treeLoading: boolean;
  @Input() treeData: any[];
  @Input() graphToShow: string;
  @Input() ehrDomain: any;
  treeConcept: any;
  testReact: boolean;

  constructor(
    public tooltipText: TooltipService,
    private api: DataBrowserService,
    private router: Router,
    private route: ActivatedRoute) {
    this.testReact = environment.testReact;
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

  public exploreConcept(conceptId: any) {
    this.router.navigate(
      ['/ehr/' + this.ehrDomain.name.toLowerCase()],
         {
            relativeTo: this.route,
            queryParams: { search: conceptId, explore: 'true' }
        });
  }
}
