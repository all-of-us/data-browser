import { Component } from '@angular/core';
import * as React from 'react';

import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { menuItems, socialLinks } from 'app/shared/services/header-footer.service';
import { reactStyles } from 'app/utils';
import { environment } from 'environments/environment';

const styles = reactStyles({
  footer: {
    background: 'rgba(38, 34, 98, 1)',
    width: '100vw',
    padding: '14px'
  },
  mainMenuItem: {
    color: 'white',
    fontSize: '0.9rem',
    width: '100%',
    marginTop: '0.5rem',
    paddingBottom: '0.25rem',
  },
  mainMenuItemLink: {
    color: 'white',
    fontFamily: 'GothamBold, Helvetica Neue, sans-serif',
    textTransform: 'uppercase'
  },
  nihLogo: {
    marginTop: '1rem',
    marginLeft: ' -0.5rem',
    maxWidth: '11rem'
  },
  siteLogo: {
    margin: '1rem .5rem 0 0',
    maxWidth: '11rem'
  }
});

const css = `
  footer .foot-apply a {
    display: block;
    margin-top: 1rem;
    text-align: center;
    background: #ffffff;
    font-size: 19px;
    padding: 8px 0;
    line-height: 19px;
    font-family: GothamBold, "Helvetica Neue", sans-serif;
    border: 1px solid #fff;
  }
  footer .foot-apply a:hover {
    background-color: rgba(190, 225, 255, 1);
  }
  footer .footer-layout * {
    font-family: "Gotham A", "Gotham B", "Helvetica Neue", sans-serif;
    font-weight: normal;
  }
  footer .footer-layout {
    display: flex;
    justify-content: space-between;
  }
  footer .login-btn a {
    display: block;
    border: 1px white solid;
    padding: 1em;
    margin-top: 0.5rem;
    text-align: center;
    font-size: 0.7em;
    color: white;
    line-height: 1;
    width: 100%;
  }
  footer .login-btn a:hover {
    background-color: rgba(190, 225, 255, 1);
    color: #262262;
  }
  footer .footer-logo {
    display: grid;
    grid-template-columns: 25% 25% 25% 25%;
    width: 90%;
  }
  footer .main-menu {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10%, 25%));
    width: 100%;
    margin-top: 0.5rem;
    padding-right: 1rem;
  }
  footer .sub-menu {
    margin-top: 1rem;
    margin-left: 0;
    display: block;
    flex-wrap: wrap;
  }
  footer .sub-menu li > a {
    color: rgba(190, 225, 255, 1);
    padding-right: 0.5em;
  }
  footer .sub-menu li > a:hover {
    color: white;
  }
  footer ul {
    list-style: none;
  }
  @media only screen and (max-width: 770px) {
    footer .footer-layout {
        flex-direction: column;
    }
    footer .main-menu {
        display: flex;
        flex-direction: column;
        margin: 0;
        margin-top: 0.5rem;
    }
    footer .main-menu li {
        padding: 0;
    }
    footer .sub-menu {
        display: block;
        margin-top: 0;
    }
    footer .site-branding-container {
        /* width: calc(100%/1); */
        padding: 0;
    }
    footer .footer-logo {
        display: block;
    }
  }
`;

const RhFooter: React.FunctionComponent = () => {
  return <footer style={styles.footer}>
    <style>{css}</style>
    <div className='db-container'>
      <div style={{ width: '100%' }}>
        <div style={{ background: 'transparent' }}>
          <div className='footer-logo'>
            <div style={styles.siteLogo}>
              <a href={environment.researchAllOfUsUrl} className='custom-logo-link'>
                <img src='/assets/db-images/allofus_research-hub_white.png'
                  style={{ minWidth: '9rem' }}
                  alt='All of Us Research Hub' />
              </a>
            </div>
            <div style={styles.nihLogo}>
              <a href='https://allofus.nih.gov/' target='_blank'>
                <img alt='National Institute of Health All of Us Research Program'
                  style={{ minWidth: '9rem' }}
                  src='/assets/db-images/nih_allofus_white.png' />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className='footer-layout'>
        <ul className='main-menu'>
          {menuItems.map((menu, m) => <li key={m} style={styles.mainMenuItem}>
            <a href={menu.url} style={styles.mainMenuItemLink}>{menu.title}</a>
            {menu.submenu.length > 0 && <ul className='sub-menu'>
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
        <ul>
          <li className='foot-apply'>
            <a href='https://www.researchallofus.org/register/'>REGISTER</a>
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
                  <img src={item.image} alt={item.name} />
                </a>
              </li>)}
            </ul>
          </div>
          <div className='cta-col'>
            <button className='sub-btn'>SUBSCRIBE TO UPDATES</button>
          </div>
        </div>
        <div className='footer-boiler'>
          <section>
            <p>Precision Medicine Initiative, PMI,&nbsp;
              <i>All of Us</i>, the <i>All of Us</i> logo, and &#8220;The
              Future of Health Begins With You&#8221; are service marks of the&nbsp;
              <a href='https://www.hhs.gov/' target='_blank' rel='noopener noreferrer'>
                U.S. Department of Health and Human Services
              </a>. The <i>All of Us</i> platform is for research only and does not&nbsp;
              provide medical advice, diagnosis, or treatment.
            </p>
          </section>
        </div>
        <div className='site-info'><br />
          Copyright {new Date().getFullYear()} |&nbsp;
          <a href='https://www.researchallofus.org/privacy-policy/'>
            Privacy Policy
          </a>
          <span role='separator' aria-hidden='true' />
        </div>
      </div>
    </div>
  </footer>;
};

@Component({
  selector: 'app-rh-footer-react',
  template: '<div #root></div>',
})
export class RhFooterReactComponent extends BaseReactWrapper {
  constructor() {
    super(RhFooter, []);
  }
}
