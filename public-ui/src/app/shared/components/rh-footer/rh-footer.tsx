import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';

import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { menuItems, socialLinks } from 'app/shared/services/header-footer.service';
import { environment } from 'environments/environment';

export const RhFooter: React.FunctionComponent = () => {
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
            <a href={menu.url} style={{color: '#FFFFFF'}}>{menu.title}</a>
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
    <div className='db-footer'>
      <div className='db-container'>
        <div className='cta-layout'>
          <div className='cta-col'>
            <p>
              Learn more about becoming a participant at <a href='https://joinallofus.org'
                                                            target='_blank'
                                                            rel='noopener'>JoinAllofUs.org</a>
            </p>
          </div>
          <div className='cta-col'>
            <p>
              Learn more about the program protocol, leadership, and governance at&nbsp;
              <a href='https://allofus.nih.gov'
                 target='_blank'
                 rel='noopener'>AllofUs.nih.gov</a>
            </p>
          </div>
          <div className='cta-col'>
            <p>Follow <i>All of Us</i></p>
            <ul id='menu-social' className='social-links-menu'>
              {socialLinks.map((item, i) => <li key={i}>
                <a target='_blank' rel='noopener noreferrer' href={item.url}>
                  <span className='screen-reader-text'>{item.name}</span>
                  <img src={item.image} alt={item.name}/>
                </a>
              </li>)}
            </ul>
          </div>
          <div className='cta-col'>
            <button className='sub-btn mailchimpbutton'>SUBSCRIBE TO UPDATES</button>
          </div>
        </div>
        <div className='footer-boiler'>
          <section>
            <p>Precision Medicine Initiative, PMI,&nbsp;
               <span className='allofus-italics'>All of Us</span>, the&nbsp;
               <span className='allofus-italics'>All of Us</span> logo, and &#8220;The
               Future of Health Begins With You&#8221; are service marks of the&nbsp;
              <a href='https://www.hhs.gov/' target='_blank' rel='noopener noreferrer'>
                U.S. Department of Health and Human Services
              </a>. The&nbsp;
              <span className='allofus-italics'>All of Us</span>&nbsp;
              platform is for research only and does not provide medical advice,
              diagnosis, or treatment.
            </p>
          </section>
        </div>
        <div className='site-info'><br/>
          Copyright 2020 |&nbsp;
          <a className='privacy-policy-link'
             href='https://www.researchallofus.org/privacy-policy/'>
            Privacy Policy
          </a>
          <span role='separator' aria-hidden='true'/>
        </div>
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
