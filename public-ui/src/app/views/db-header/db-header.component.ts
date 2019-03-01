import { Component, Input, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
  }

  public toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  }
}
