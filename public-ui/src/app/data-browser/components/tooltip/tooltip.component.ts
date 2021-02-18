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
  tooltips: Array<string>;

  constructor(public dbc: DbConfigService, public tooltip: TooltipService) { }

  ngOnInit() {
    this.tooltips = this.getTooltips();
  }

  public hoverOnTooltip() {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      this.label, this.searchTerm, this.action);
  }

  public getTooltips() {
    return (typeof this.tooltip.tooltips[this.tooltipKey] === 'string') ? [this.tooltip.tooltips[this.tooltipKey]] : this.tooltip.tooltips[this.tooltipKey]['texts'];
  }

}
