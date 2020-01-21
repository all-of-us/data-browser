import {Component, Input, OnInit} from '@angular/core';
import {DbConfigService} from '../../../utils/db-config.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css', '../../../styles/page.css']
})
export class TooltipComponent implements OnInit {
  @Input() toolTipText1: string;
  @Input() toolTipText2: string;
  @Input() toolTipText3: string;
  @Input() toolTipText4: string;
  @Input() toolTipText5: string;
  @Input() label: string;
  @Input() searchTerm: string;
  @Input() action: string;
  
  constructor(public dbc: DbConfigService) { }

  ngOnInit() {
  }

  public haveMultipleTooltipTexts() {
    if (this.haveThreeToolTipTexts() || this.haveFiveToolTipTexts()) {
      return true;
    } else {
      return false;
    }
  }

  public haveThreeToolTipTexts() {
    if (this.toolTipText1 && this.toolTipText2 && this.toolTipText3) {
      if (this.toolTipText1.length > 0 && this.toolTipText2.length > 0
        && this.toolTipText3.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public haveFiveToolTipTexts() {
    if (this.toolTipText1 && this.toolTipText2 && this.toolTipText3 && this.toolTipText4 && this.toolTipText5) {
      if (this.toolTipText1.length > 0 && this.toolTipText2.length > 0 && this.toolTipText3.length > 0
        && this.toolTipText4.length > 0 && this.toolTipText5.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public hoverOnTooltip() {
    this.dbc.triggerEvent('tooltipsHover', 'Tooltips', 'Hover',
      this.label, this.searchTerm, this.action);
  }

}
