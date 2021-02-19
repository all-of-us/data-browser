import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';

import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { menuItems } from 'app/shared/services/header-footer.service';
import { environment } from 'environments/environment';

const RhFooter: React.FunctionComponent = () => {
  return <footer>
    <div className='db-container'>
      <div className='site-branding-container'>
        <div className='site-branding'>
          <div className='logo'>
            <div className='site-logo'>
              <a href={environment.researchAllOfUsUrl} className='custom-logo-link'>
                <img src='/assets/db-images/allofus_research-hub_white.png'
                     className='custom-logo'
                     alt='All of Us Research Hub'/>
              </a>
            </div>
            <div className='nih-logo'>
              <a href='https://allofus.nih.gov/' target='_blank'>
                <img alt='National Institute of Health All of Us Research Program'
                     className='nih_header'
                     src='/assets/db-images/nih_allofus_white.png'/>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className='footer-layout'>
        <ul className='main-menu'>
          {menuItems.map((menu, m) => <li key={m} className='main-menu-item menu-item-has-children'>
            <a href={menu.url}>{menu.title}</a>
            {menu.submenu.length > 0 && <ul  className='sub-menu'>
              {menu.submenu.map((sub, s) => <li key={s} className={'menu-item-has-children: sub.submenu, flip: showSub1'}>
                <a href={sub.url}>{sub.title}</a>
                {sub.submenu.length > 0 && <ul>
                  {sub.submenu.map((sub1, s1) => <li key={s1}>
                    <a href=''>{sub1.title}</a>
                  </li>)}
                </ul>}
              </li>)}
            </ul>}
          </li>)}
        </ul>
        <ul className='footer-menu'>
          <li className='foot-apply'>
            <a href='https://www.researchallofus.org/apply/'>APPLY</a>
          </li>
          <li className='login-btn'>
            <a href='https://workbench.researchallofus.org/login'> RESEARCHER
              LOGIN</a>
          </li>
        </ul>
      </div>
    </div>
  </footer>;
};

@Component({
  selector: 'app-rh-footer-react',
  template: '<div #root></div>',
  styleUrls: ['./rh-footer.component.css', '../../../styles/template.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RhFooterReactComponent extends BaseReactWrapper {
  constructor() {
    super(RhFooter, []);
  }
}
