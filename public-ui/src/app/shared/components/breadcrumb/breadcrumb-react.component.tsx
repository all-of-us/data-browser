import * as React from "react";
import * as fp from "lodash/fp";

import { environment } from "environments/environment";
import { Component } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { reactStyles } from "app/utils";
import {
  NavStore,
  routeConfigDataStore,
  urlParamsStore,
} from "app/utils/navigation";
import { Subscription } from "rxjs/Subscription";

const styles = reactStyles({
  preCrumb: {
    color: "#0079b8",
    marginRight: "0.5em",
    textDecoration: "none",
    cursor: "pointer",
  },
  crumb: {
    color: "#2b266d",
    marginRight: "0.5em",
  },
  crumbContainer: {
    paddingLeft: "1rem",
    paddingTop: "1rem",
    margin: "0 calc(10%)",
  },
  separator: {
    marginRight: "0.5em",
  },
});

const COPE_ID = "covid-19-participant-experience";

export const BreadCrumbComponent = class extends React.Component<
  {},
  { breadcrumb: string }
> {
  subscription: Subscription;
  constructor(props) {
    super(props);
    this.state = { breadcrumb: undefined };
  }

  componentDidMount() {
    this.subscription = routeConfigDataStore.subscribe((routeData) => {
      const { id } = urlParamsStore.getValue();
      let breadcrumb;
      if (id && routeData.breadcrumb) {
        breadcrumb =
          id === COPE_ID
            ? "COVID-19 Participant Experience (COPE) Survey"
            : fp.startCase(
                routeData.breadcrumb.value.replace(":id", id).replace("-", " ")
              );
      } else if (routeData.breadcrumb) {
        breadcrumb = routeData.breadcrumb.value;
      }
      if (breadcrumb === 'Labs And Measurements') {
            breadcrumb = 'Labs & Measurements';
      }
      if (breadcrumb === 'SNV/Indel Variants') {
           // breadcrumb = 'Test';
      }
      this.setState({ breadcrumb });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { breadcrumb } = this.state;
    return (
      <div style={styles.crumbContainer}>
        <a href={environment.researchAllOfUsUrl} style={styles.preCrumb}>
          Home
        </a>
        <span style={styles.separator}>&gt;</span>
        <a
          onClick={() => NavStore.navigateByUrl("/")}
          style={breadcrumb ? styles.preCrumb : styles.crumb}
        >
          Data Browser
        </a>
        {!!breadcrumb && (
          <React.Fragment>
            <span style={styles.separator}>&gt;</span>
            <span style={styles.crumb}>{breadcrumb}</span>
          </React.Fragment>
        )}
      </div>
    );
  }
};

@Component({
  // tslint:disable-next-line: component-selector
  selector: "react-breadcrumbs",
  template: `<span #root></span>`,
})
export class BreadCrumbWrapperComponent extends BaseReactWrapper {
  constructor() {
    super(BreadCrumbComponent, []);
  }
}