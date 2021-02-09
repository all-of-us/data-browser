import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.css']
})
export class MyComponentComponent {

  public counter = 21;

  public handleOnClick(stateCounter: number) {
    this.counter++;
  }
}
