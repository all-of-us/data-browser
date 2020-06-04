import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.css', '../../../styles/template.css']
})
export class PopUpComponent {
  @Input() statement: string;
  @Input() title: string;
  @Output() closed: EventEmitter<any> = new EventEmitter;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.close();
}

  close() {
    this.closed.emit(true);
  }
}
