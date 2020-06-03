import { Component, EventEmitter , Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css', '../../../styles/template.css']
})
export class PopUpComponent implements OnChanges {
  @Input() statement: string;
  @Input() title: string;
  @Output() closed: EventEmitter<any> = new EventEmitter;
  showStatement = true;
  body: string;
  title: string;
  constructor() { }

  ngOnChanges() {

  }

  close() {
    this.showStatement = false;
    this.closed.emit();
  }