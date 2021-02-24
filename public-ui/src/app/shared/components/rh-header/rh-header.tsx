import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';

import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { menuItems } from 'app/shared/services/header-footer.service';
import { environment } from 'environments/environment';

interface State {
  menuOpen: boolean;
  submenusOpen: Array<string>;
}

export class RhHeader extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {menuOpen: false, submenusOpen: []};
  }

  toggleMobileSubmenu(title: string) {
    const {submenusOpen} = this.state;
    const updatedSubmenusOpen = submenusOpen.includes(title) ?
      submenusOpen.filter(sub => sub !== title) :
      [...submenusOpen, title];
    this.setState({submenusOpen: updatedSubmenusOpen});
  }

  render() {
    const {menuOpen, submenusOpen} = this.state;
    return <React.Fragment>
      <div className='cta-bar'>
        <a href='https://workbench.researchallofus.org/login' className='login-btn'>
          RESEARCHER LOGIN
        </a>
      </div>
      <div id='masthead' className='site-header'>
        <div className='headwrap'>
          <div className='site-branding-container'>
            <div className='site-branding'>
              <div className='logo'>
                <div className='site-logo'>
                  <a href={environment.researchAllOfUsUrl} className='custom-logo-link'>
                    <img width='4356' height='528'
                         src='/assets/db-images/allofus_research-hub_color.png'
                         className='custom-logo'
                         alt='All of Us Research Hub'/>
                  </a>
                </div>
                <div className='divider'/>
                <div className='nih-logo'>
                  <a href='https://allofus.nih.gov/' target='_blank'>
                    <img alt='National Institute of Health All of Us Research Program' className='nih_header'
                      src='/assets/db-images/nih_allofus_color.png' />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className='site-nav-container'>
            <nav id='site-navigation' className='main-navigation' aria-label='Top Menu'>
              <div className='menu-primary-container'>
                <ul className='main-menu'>
                  {menuItems.map((menu, m) => <li key={m} className='main-menu-item menu-item-has-children'>
                    <a href={menu.url}> {menu.title}</a>
                    {menu.submenu.length > 0 && <ul className='sub-menu'>
                      {menu.submenu.map((sub, s) => <li key={s}>
                        <a className={sub.title === 'Data Browser' ? 'active-menu' : ''}
                           href={sub.url}>
                          {sub.title}
                        </a>
                      </li>)}
                    </ul>}
                  </li>)}
                  <li className='icon_search main-menu-item menu-item-has-children'>
                    <a><svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22' fill='none'
                        fill-rule='evenodd' stroke='#262262' stroke-linejoin='round' stroke-width='3'>
                        <path fill='none' d='M15.313 8.813a6.5 6.5 0 1 1-13.001-.001 6.5 6.5 0 0 1 13 0z' />
                        <path stroke-linecap='round' d='M13.848 13.848l5.84 5.84' /></svg></a>
                    <ul className='sub-menu'>
                      <li className='menu-item'>
                        <input type='text' value='' />
                      </li>
                    </ul>
                  </li>
                  <li className='nav_apply'>
                    <a href='https://www.researchallofus.org/apply/'>APPLY</a>
                  </li>
                </ul>
                <div className='mobile-nav'>
                  <div className={menuOpen ? 'clicked' : ''}
                       onClick={() => this.setState({menuOpen: !menuOpen})}
                       id='nav-icon'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
        {menuOpen && <ul id='menu-mobile'>
          {menuItems.map((menu, m) =>
            <li className={`main-menu-item menu-item-has-children ${menu.title} ${submenusOpen.includes(menu.title) ? 'flip' : ''}`}
                onClick={() => this.toggleMobileSubmenu(menu.title)}>
              <a href={menu.url}>{menu.title}</a>
              {submenusOpen.includes(menu.title) && menu.submenu.length > 0 && <ul className='sub-menu'>
                {menu.submenu.map((sub, s) => <li key={s} className='menu-item'>
                  <a href={sub.url}>{sub.title}</a>
                </li>)}
              </ul>}
            </li>
          )}
          <li className='main-menu-item search'>
            <input type='submit' id='searchsubmit' value='' />
          </li>
          <li className='nav_apply'>
            <a href='https://www.researchallofus.org/apply/'>APPLY</a>
          </li>
          <li className='cta-bar'>
            <a href='https://workbench.researchallofus.org/login' className='login-btn'>
              RESEARCHER LOGIN
            </a>
          </li>
        </ul>}
      </div>
    </React.Fragment>;
  }
}

@Component({
  selector: 'app-rh-header-react',
  template: '<div #root></div>',
  styleUrls: ['./rh-header.component.css', '../../../styles/template.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RhHeaderReactComponent extends BaseReactWrapper {
  constructor() {
    super(RhHeader, []);
  }
}
