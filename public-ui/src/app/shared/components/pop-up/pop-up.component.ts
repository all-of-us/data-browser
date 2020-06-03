import { Component, EventEmitter , Input, Output } from '@angular/core';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css', '../../../styles/template.css']
})
export class PopUpComponent {
  @Input() statement: string;
  @Input() title: string;
  @Output() closed: EventEmitter<any> = new EventEmitter;
  showStatement = true;
  body: string;


  close() {
    this.showStatement = false;
    this.closed.emit();
  }