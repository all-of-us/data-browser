import { environment } from "environments/environment";
import { Component, OnInit } from "@angular/core";
@Component({
  selector: "app-beta-bar",
  templateUrl: "./beta-bar.component.html",
  styleUrls: ["./beta-bar.component.css"],
})
export class BetaBarComponent implements OnInit {
  allOfUsUrl: string;
  constructor() {}

  ngOnInit() {
    this.allOfUsUrl = environment.researchAllOfUsUrl;
  }
}
