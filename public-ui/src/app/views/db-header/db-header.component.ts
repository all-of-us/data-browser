import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-db-header',
  templateUrl: './db-header.component.html',
  styleUrls: ['./db-header.component.css', '../../styles/template.css']
})
export class DbHeaderComponent implements OnInit {
  @Input() noMenu = false;
  topMenuItemToggle = false;
  openTopMenu = false;
  openAbout = false;
  openDataTools = false;
  openSearch = false;
  allOfUsUrl = environment.researchAllOfUsUrl;
  constructor() {}

  ngOnInit() {
  }

  public toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  }
}
