import { Component, Input, OnChanges } from '@angular/core';
import { Concept } from '../../../publicGenerated';
import { TooltipService } from '../../utils/tooltip.service';
@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['../../styles/template.css','./sources.component.css']
})
export class SourcesComponent implements OnChanges {
  @Input() concept: Concept;
  @Input() treeLoading: boolean;
  @Input() treeData: any[];
  @Input() graphToShow: string;

  constructor(public tooltipText: TooltipService) { }

  ngOnChanges() {
  }

}
