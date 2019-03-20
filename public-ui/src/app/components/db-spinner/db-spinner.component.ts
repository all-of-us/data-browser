import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-db-spinner',
  templateUrl: './db-spinner.component.html',
  styleUrls: ['./db-spinner.component.css']
})
export class DbSpinnerComponent {
  @Input() loading: boolean;
  constructor() { }
}
