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
  allOfUs: string;
  constructor() {
    this.allOfUs = environment.researchAllOfUsUrl;
  }

  ngOnInit() {
  }

  public toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  }
}
