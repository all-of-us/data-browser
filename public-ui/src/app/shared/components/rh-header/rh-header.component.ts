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
  menuItems: any[];
  subTitle: boolean;
  showSub: boolean;
  menuModel = {};
  constructor(public hFService: HeaderFooterService) { }

  ngOnInit() {
    this.menuItems = this.hFService.menu;
    this.menuItems.forEach(item => {
      this.menuModel[item.title] = false;
    });
    this.allOfUsUrl = environment.researchAllOfUsUrl;

  }

  public searchHub(form) {
    window.location.href = `${this.allOfUsUrl}/?s=${form.value.s}`;
  }

  public toggleTopMenu() {
    this.openTopMenu = !this.openTopMenu;
  }

  public toggleSub(title: string, index: number) {
    if (this.menuItems[index].title === title) {
      this.showSub = !this.showSub;
    }
  }


}
