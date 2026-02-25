import { Component, Input } from "@angular/core";

@Component({
  standalone: false,
  selector: "app-spinner",
  templateUrl: "./spinner.component.html",
  styleUrls: ["./spinner.component.css"],
})
export class SpinnerComponent {
  @Input() loading: boolean;
  @Input() dots: boolean;
  constructor() {}
}
