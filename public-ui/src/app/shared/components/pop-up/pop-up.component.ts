import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css', '../../../styles/template.css']
})
export class PopUpComponent {
  @Input() statement: string;
  @Input() title: string;
  @Output() closed: EventEmitter<any> = new EventEmitter;


  close() {
    this.closed.emit(true);
  }
}
