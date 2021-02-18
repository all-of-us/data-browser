import {Component, Input, OnInit} from '@angular/core';
import {DbConfigService} from '../../../utils/db-config.service';
import {TooltipService} from '../../services/tooltip.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css', '../../../styles/page.css']
})
export class TooltipComponent implements OnInit {
  @Input() label: string;
  @Input() searchTerm: string;
  @Input() action: string;
  @Input() tooltipKey: string;

  constructor(public dbc: DbConfigService, public tooltip: TooltipService) { }

  ngOnInit() {
  }

  public hoverOnTooltip() {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      this.label, this.searchTerm, this.action);
  }

  public getTooltips() {
    return "texts" in this.tooltip[this.tooltipKey] ? this.tooltip[this.tooltipKey]['texts'] : this.tooltip[this.tooltipKey];
  }

}
