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
  allOfUsUrl: string;

  constructor() {}

  ngOnInit() {
    this.allOfUsUrl = environment.researchAllOfUsUrl;
  }

  public searchHub(form) {
    console.log(form,"this is the form");
    window.location.href = `https://www.staging.researchallofus.org/?s=${form.value.s}`;
  }

  public toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  }
}
