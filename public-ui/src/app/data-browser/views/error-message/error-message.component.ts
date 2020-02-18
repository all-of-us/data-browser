import {Component, Input, OnInit} from '@angular/core';
import {Concept} from "../../../../publicGenerated/model/concept";

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css',
              '../../../styles/page.css']
})
export class ErrorMessageComponent implements OnInit {
  
  @Input() dataType: Concept;
  
  constructor() { }

  ngOnInit() {
  }

}
