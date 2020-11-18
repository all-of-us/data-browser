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
          title: 'Researcher Workshops',
          url: 'https://www.researchallofus.org/researchers-as-partners/researcher-workshops-and-public-input/',
          submenu: false
        },
        {
          title: 'Privacy & Security Protocols',
          url: 'https://www.researchallofus.org/privacy-security-protocols/',
          submenu: false
        },
        {
          title: 'Institutional Agreements',
          url: 'https://www.researchallofus.org/institutional-agreements/',
          submenu: false
        },
        {
          title: 'Research Hub Updates',
          url: 'https://www.researchallofus.org/research-hub-updates/',
          submenu: false
        }],
      },
      {
        title: 'data',
        url: 'https://www.researchallofus.org/data-snapshots/',
        submenu: true,
        sub0: [{
          title: 'Data Snapshots',
          url: 'https://www.researchallofus.org/data-snapshots/',
          submenu: false
        },
        {
          title: 'Data Sources',
          url: 'https://www.researchallofus.org/data-sources/',
          submenu: false
        },
        {
          title: 'Data Methods',
          url: 'https://www.researchallofus.org/data-sources/methods/',
          submenu: false
        },
        {
          title: 'Data Access',
          url: 'https://www.researchallofus.org/data-access/',
          submenu: false
        },
        {
          title: 'Data Use Policies',
          url: 'https://www.researchallofus.org/data-use-policies',
          submenu: false
        }]
      },
      {
        title: 'tools',
        url: 'https://www.researchallofus.org/workbench/',
        submenu: true,
        sub0: [{
          title: 'Survey Explorer',
          url: 'https://www.researchallofus.org/data-sources/survey-explorer/',
          submenu: false
        },
        {
          title: 'Data Browser',
          url: 'https://databrowser.researchallofus.org/',
          submenu: false
        },
        {
          title: 'Researcher Workbench',
          url: 'https://www.researchallofus.org/workbench/',
          submenu: false,
        },
        {
          title: 'Guides & Support',
          url: 'https://www.researchallofus.org/guides-support/',
          submenu: false,
        }]
      },
      {
        title: 'Discover',
        url: '',
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
        sub1: [
          {
            title: 'FAQ',
            url: this.allOfUsUrl + '/frequently-asked-questions/',
            submenu: false
          }
        ],
        sub2: [
          {
            title: `WE'RE IN BETA`,
            url: '#',
            submenu: false
          }
        ]
      },
      {
        title: 'FAQ',
        url: this.allOfUsUrl + '/frequently-asked-questions/',
        submenu: false
      }
    ];
  }
}
