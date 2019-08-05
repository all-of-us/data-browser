import { Component, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css', '../../../../styles/page.css']
})
export class ItemComponent implements OnChanges {
  @Input() item: { title: string, subInfo: string };
  @Input() isActive: boolean;
  selectedItem: string;

  constructor() { }

  ngOnChanges() {}

}
