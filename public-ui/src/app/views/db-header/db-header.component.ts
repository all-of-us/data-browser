import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-db-header',
  templateUrl: './db-header.component.html',
  styleUrls: ['./db-header.component.css', '../../styles/template.css']
})
export class DbHeaderComponent implements OnInit {
  @Input() noMenu = false;
  openMobileMenu = false;
  openSubMenu = false;
  openDataTools = false;
  openSearch = false;
  allOfUsUrl: string;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.allOfUsUrl = environment.researchAllOfUsUrl;
  }

  public clickMobileNav() {
    const mobilenav = this.el.nativeElement.getElementsByClassName('mobile-nav');
    for (let i = 0; i < mobilenav.length; i++) {
      mobilenav[i].classList.toggle('open');
      this.el.nativeElement.querySelector('.main-menu').classList.toggle('open');
    }

  }

  public clickMobileNavItem() {
    const mobileNavAcc = this.el.nativeElement.getElementsByClassName('menu-item');
    for (let i = 0; i < mobileNavAcc.length; i++) {
      mobileNavAcc[i].addEventListener('click', function () {
        const nextup = this.lastElementChild;
        nextup.classList.toggle('mobileopen');
        this.classList.toggle('flip');
      });
    }
  }

  public headerSearch(f: NgForm) {
    window.location.href = this.allOfUsUrl + '/?s=' + f.value.s;
  }
}
