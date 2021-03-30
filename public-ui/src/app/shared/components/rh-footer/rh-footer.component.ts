import { Component, OnInit } from '@angular/core';
import { HeaderFooterService } from 'app/shared/services/header-footer.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-rh-footer',
  templateUrl: './rh-footer.component.html',
  styleUrls: ['./rh-footer.component.css', '../../../styles/template.css']
})
export class RhFooterComponent implements OnInit {
  menuItems: any;
  allOfUsUrl: any;
  constructor(public hFService: HeaderFooterService) { }

  ngOnInit() {
  this.menuItems = this.hFService.menu;
  this.allOfUsUrl = environment.researchAllOfUsUrl;
  }

}
