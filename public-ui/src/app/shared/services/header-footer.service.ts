import { Injectable } from '@angular/core';

@Injectable()
export class HeaderFooterService {

  menu: any;


  constructor() {
    this.menu = [
      {
        title: 'about',
        url: 'https://www.researchallofus.org/about-the-research-hub/',
        submenu:true,
        sub0: [{
          title: 'About the Research Hub ',
          url: 'https://www.researchallofus.org/about-the-research-hub/',
          submenu: false
        },
        {
          title: 'Researcher as Partners',
          url: 'https://www.researchallofus.org/researchers-as-partners/',
          submenu: true,
          sub1: [{
            title: 'Researcher Workshops and Public Input',
            url: 'https://www.researchallofus.org/researchers-as-partners/researcher-workshops-and-public-input/',
            submenu: false
          }]
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
        title: 'data',
        url: 'https://www.researchallofus.org/data-snapshots/',
        submenu: true,
        sub0: [{
          title: 'Data Snapshots',
          url: 'https://www.researchallofus.org/data-snapshots/',
          submenu: false
        },
        {
          title: 'Data Browser',
          url: 'https://databrowser.researchallofus.org/',
          submenu: false
        },
        {
          title: 'Data Sources',
          url: 'https://www.researchallofus.org/data-sources/',
          submenu: true,
          sub1: [{
            title: 'Methods',
            url: 'https://www.researchallofus.org/data-sources/methods/',
            submenu: false
          },
          {
            title: 'Survey Explorer',
            url: 'https://www.researchallofus.org/data-sources/survey-explorer/',
            submenu: false
          }]
        }]
      },
      {
        title: 'tools',
        url: 'https://www.researchallofus.org/workbench/',
        submenu: true,
        sub0: [{
          title: 'Workbench',
          url: 'https://www.researchallofus.org/workbench/',
          submenu: false,
        }]
      }
    ]
   }

}
