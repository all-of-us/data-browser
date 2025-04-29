import * as React from "react";

import { environment } from "environments/environment";
import { Component, ViewEncapsulation } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { menuItems } from "app/shared/services/header-footer.service";

interface State {
  menuOpen: boolean;
  searchTerms: string;
  submenusOpen1: boolean;
  submenusOpen2: boolean;
  submenusOpen3: boolean;
  submenusOpen4: boolean;
}

export class RhHeader extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      menuOpen: false,
      searchTerms: "",
      submenusOpen1: false,
      submenusOpen2: false,
      submenusOpen3: false,
      submenusOpen4: false,
    };
  }

  render() {
    const {
      menuOpen,
      searchTerms,
      submenusOpen1,
      submenusOpen2,
      submenusOpen3,
      submenusOpen4,
    } = this.state;
    return (
      <React.Fragment>
        <header
          id="rh-nav"
          className={"rh__nav site-header " + (menuOpen ? "nav--open" : "")}
        >
          <div>
            <div id="login-db-header" className="nav__login show--screen">
              <a href="https://workbench.researchallofus.org/login">
                RESEARCHER LOGIN
              </a>
            </div>
            <div className="nav__container">
              <div className="nav__logos">
                <div className="logo__ logo--rh">
                  <a
                    href="https://www.researchallofus.org/"
                    className="katactive"
                  >
                    <img src="/assets/images/logos-fpo-logo.svg" />
                  </a>
                </div>
                <div className="logo__ logo--spacer">
                  <div />
                </div>
                <div className="logo__ logo--nih">
                  <a href="https://allofus.nih.gov/">
                    <img src="/assets/images/logos-nih-ao-u-logo-color.svg" />
                  </a>
                </div>
              </div>
              <nav
                id="rh-site-navigation"
                className="nav__"
                aria-label="Top Menu"
              >
                <div className="menu-primary-container">
                  <ul id="menu-primary" className="nav__items main-menu">
                    <li
                      onClick={() =>
                        this.setState({ submenusOpen1: !submenusOpen1 })
                      }
                      id="menu-item-4088"
                      className={
                        "menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-4088 " +
                        (submenusOpen1 ? "sub--nav--open" : "")
                      }
                    >
                      <a href="https://www.researchallofus.org/about/">About</a>
                      <div className="item-expand" />
                      <ul className="sub-menu">
                        <li
                          id="menu-item-1833"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1833"
                        >
                          <a href="https://www.researchallofus.org/about-the-research-hub/">
                            About the Research Hub
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-93"
                          className="icon_researchers-as-partners menu-item menu-item-type-post_type menu-item-object-page menu-item-93"
                        >
                          <a href="https://www.researchallofus.org/institutional-agreements/">
                            Registered Institutions
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-91"
                          className="icon_privacy-security menu-item menu-item-type-post_type menu-item-object-page menu-item-91"
                        >
                          <a href="https://www.researchallofus.org/privacy-security-protocols/">
                            Privacy &amp; Security Protocols
                          </a>
                          <div className="item-expand" />
                        </li>
                        {/* <li
                          id="menu-item-666"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-666"
                        >
                          <a href="https://www.researchallofus.org/research-hub-updates/">
                            Research Hub Updates
                          </a>
                          <div className="item-expand" />
                        </li> */}
                        <li
                          id="menu-item-100"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-100"
                        >
                          <a href="https://www.researchallofus.org/frequently-asked-questions/">
                            FAQ
                          </a>
                          <div className="item-expand" />
                        </li>
                      </ul>
                    </li>
                    <li
                      onClick={() =>
                        this.setState({ submenusOpen2: !submenusOpen2 })
                      }
                      id="menu-item-3760"
                      className={
                        "menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-3760 " +
                        (submenusOpen2 ? "sub--nav--open" : "")
                      }
                    >
                      <a href="https://www.researchallofus.org/data-tools/">
                        Data &amp; Tools
                      </a>
                      <div className="item-expand" />
                      <ul className="sub-menu">
                        <li
                          id="menu-item-1465"
                          className="menu-item  menu-item-type-custom menu-item-object-custom menu-item-1465 current-menu-item"
                        >
                          <a href="/">Data Browser</a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-1834"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1834"
                        >
                          <a href="https://www.researchallofus.org/data-tools/data-snapshots/">
                            Data Snapshots
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-2983"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2983"
                        >
                          <a href="https://www.researchallofus.org/data-tools/data-access/">
                            Data Access Tiers
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-1464"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1464"
                        >
                          <a href="https://www.researchallofus.org/data-tools/data-sources/">
                            Data Sources
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-2981"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2981"
                        >
                          <a href="https://www.researchallofus.org/data-tools/methods/">
                            Data Methods
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-2982"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2982"
                        >
                          <a href="https://www.researchallofus.org/data-tools/survey-explorer/">
                            Survey Explorer
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-1462"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-1462"
                        >
                          <a href="https://www.researchallofus.org/data-tools/workbench/">
                            Researcher Workbench
                          </a>
                          <div className="item-expand" />
                        </li>
                      </ul>
                    </li>
                    <li
                      onClick={() =>
                        this.setState({ submenusOpen3: !submenusOpen3 })
                      }
                      id="menu-item-4089"
                      className={
                        "menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children menu-item-4089 " +
                        (submenusOpen3 ? "sub--nav--open" : "")
                      }
                    >
                      <a href="https://www.researchallofus.org/discover/">
                        Discover
                      </a>
                      <div className="item-expand" />
                      <ul className="sub-menu">
                        <li
                          id="menu-item-3525"
                          className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3525"
                        >
                          <a href="https://www.researchallofus.org/research-projects-directory/">
                          Research Project Directory
                          </a>
                          <div className="item-expand" />
                        </li>
                        <li
                          id="menu-item-3277"
                          className="menu-item menu-item-type-post_type_archive menu-item-object-publication menu-item-3277"
                        >
                          <a href="https://www.researchallofus.org/publications/">
                            Publication Directory
                          </a>
                          <div className="item-expand" />
                        </li>
                      </ul>
                    </li>
                    <li
                      onClick={() =>
                        this.setState({ submenusOpen4: !submenusOpen4 })
                      }
                      id="menu-item-5423"
                      className={
                        "menu-item menu-item-type-custom menu-item-object-custom menu-item-5423 " +
                        (submenusOpen4 ? "sub--nav--open" : "")
                      }
                    >
                      <a href="https://aousupporthelp.zendesk.com/hc/en-us">
                        Support
                      </a>
                      <div className="item-expand" />
                    </li>
                    <li className="menu-item menu-item-has-children item--search">
                      <a>
                        <div />
                      </a>
                      <ul className="sub-menu">
                        <li className="menu-item sub--item--search">
                          <form
                            role="search"
                            method="get"
                            id="searchform"
                            className="search__form"
                            action="https://www.researchallofus.org/"
                          >
                            <input
                              type="text"
                              name="s"
                              id="s"
                              className="form__input"
                              placeholder="Search"
                              autoComplete="off"
                            />
                            <input
                              type="submit"
                              name="submit"
                              className="form__submit searchiconinput"
                              alt="Submit"
                              defaultValue="GO"
                            />
                          </form>
                        </li>
                      </ul>
                    </li>
                    <li
                      id="register-db-header"
                      className="menu-item item--apply"
                    >
                      <a href="https://www.researchallofus.org/register">
                        register
                      </a>
                    </li>
                    <li className="menu-item item--login show--mobile">
                      <a href="https://workbench.researchallofus.org/login">
                        RESEARCHER LOGIN
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
              <div
                onClick={() => this.setState({ menuOpen: !menuOpen })}
                id="nav-mobile"
                className="nav__mobile"
              />
            </div>
          </div>
        </header>
      </React.Fragment>
    );
  }
}

@Component({
  selector: "app-rh-header-react",
  template: "<div #root></div>",
  styleUrls: ["./rh-header.component.css", "../../../styles/template.css"],
  encapsulation: ViewEncapsulation.None,
})
export class RhHeaderReactComponent extends BaseReactWrapper {
  constructor() {
    super(RhHeader, []);
  }
}
