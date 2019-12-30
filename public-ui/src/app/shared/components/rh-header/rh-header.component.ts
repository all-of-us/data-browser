import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HeaderFooterService } from '../../services/header-footer.service';
@Component({
  selector: 'app-rh-header',
  templateUrl: './rh-header.component.html',
  styleUrls: ['./rh-header.component.css', '../../../styles/template.css']
})
export class RhHeaderComponent implements OnInit {
  @Input() noMenu = false;
  topMenuItemToggle = false;
  openTopMenu = false;
  openAbout = false;
  openDataTools = false;
  openSearch = false;
  openDAboutResearch = false;
  openDData = false;
  allOfUsUrl: string;
  workBenchIsBeta: boolean;
  menuItems: object[];
  subTitle: boolean;
  showSub1: boolean;
  constructor(public hFService: HeaderFooterService) { }

  ngOnInit() {
    this.menuItems = this.hFService.menu;
    this.allOfUsUrl = environment.researchAllOfUsUrl;
    this.workBenchIsBeta = environment.workBenchIsBeta;

  }

  public searchHub(form) {
    window.location.href = `${this.allOfUsUrl}/?s=${form.value.s}`;
  }

  public toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  }

  public toggleSub(title) {
    this.subTitle = title;
    this.showSub1 = !this.showSub1;
    console.log(this.subTitle, this.showSub1);
  }


}
