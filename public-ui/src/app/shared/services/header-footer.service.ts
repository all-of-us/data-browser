import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class HeaderFooterService {
  menu: any;
  allOfUsUrl: any;

  constructor() {
    this.allOfUsUrl = environment.researchAllOfUsUrl;
    this.menu = [
      {
        title: 'about',
        url: 'https://www.researchallofus.org/about-the-research-hub/',
        submenu: true,
        sub0: [{
          title: 'About the Research Hub ',
          url: 'https://www.researchallofus.org/about-the-research-hub/',
          submenu: false
        },
        {
          title: 'Researchers as Partners',
          url: 'https://www.researchallofus.org/researchers-as-partners/',
          submenu: false,
        },
        {
          title: 'Privacy & Security Protocols',
          url: 'https://www.researchallofus.org/privacy-security-protocols/',
          submenu: false
        },
        {
          title: 'Research Hub Updates',
          url: 'https://www.researchallofus.org/research-hub-updates/',
          submenu: false
        }],
      },
      {
        title: 'Data & Tools',
        url: 'https://www.researchallofus.org/data-tools/',
        submenu: true,
        class: 'active-menu',
        sub0: [
          {
            title: 'Data Browser',
            url: 'https://databrowser.researchallofus.org/',
            submenu: false,
            class: 'active-menu'
          },
          {
          title: 'Data Snapshots',
          url: 'https://www.researchallofus.org/data-snapshots/',
          submenu: false
        },
        {
          title: 'Data Access & Use',
          url: 'https://www.researchallofus.org/data-tools/data-access/',
          submenu: false
        },
        {
          title: 'Data Sources',
          url: 'https://www.researchallofus.org/data-tools/data-sources/',
          submenu: false
        },
        {
          title: 'Data Methodology',
          url: 'https://www.researchallofus.org/data-tools/methods/',
          submenu: false
        },
        {
          title: 'Researcher Workbench',
          url: 'https://www.researchallofus.org/workbench/',
          submenu: false,
        },
        {
          title: 'Survey Explorer',
          url: 'https://www.researchallofus.org/data-sources/survey-explorer/',
          submenu: false
        }
      ]
      },
      {
        title: 'Discover',
        url: 'https://www.researchallofus.org/research-projects-directory/?section=abc',
        submenu: true,
        sub0: [
          {
            title: 'Researcher Projects Directory',
            url: 'https://www.researchallofus.org/research-projects-directory/',
            submenu: false
          },
          {
            title: 'Publications',
            url: 'https://www.researchallofus.org/publications',
            submenu: false
          }
        ],
      },
      {
        title: 'FAQ',
        url: this.allOfUsUrl + '/frequently-asked-questions/',
        submenu: false
      }
    ];
  }
}
