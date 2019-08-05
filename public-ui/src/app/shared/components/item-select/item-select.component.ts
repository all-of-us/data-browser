import { Component, Input, OnChanges, Output } from '@angular/core';
@Component({
  selector: 'app-item-select',
  templateUrl: './item-select.component.html',
  styleUrls: ['./item-select.component.css', '../../../styles/page.css']
})
export class ItemSelectComponent implements OnChanges {

  @Input() list: any[];
  selectedItem:string;

  constructor() { }

  ngOnChanges() {
  }

  public setActive(selected: any) {
    this.selectedItem = '';
    this.selectedItem = selected.title;
    console.log(this.selectedItem);
  }
}


}
