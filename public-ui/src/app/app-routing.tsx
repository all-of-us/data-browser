import * as React from "react";

import { Component as AComponent } from "@angular/core";
import { AppRoute, AppRouter } from "app/components/app-router";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { EhrViewReactComponent } from "app/data-browser/views/ehr-view/ehr-view-react.component";
import { FitbitReactComponent } from "app/data-browser/views/fitbit-view/fitbit-view-react.component";
import { GenomicViewComponent } from "app/data-browser/views/genomic-view/genomic-view.component";
import { IntroVidReactComponent } from "app/data-browser/views/intro-vids/intro-vids-react.component";
import { PMReactComponent } from "app/data-browser/views/pm/pm-react.component";
import { dBHomeComponent } from "app/data-browser/views/quick-search/home-view-react.component";

import { SurveyViewReactComponent } from "./data-browser/views/survey-view/survey-react-view.component";

export const AppRoutingComponent: React.FunctionComponent = () => {
  return (
    <AppRouter>
      <AppRoute
        path="/"
        component={() =>
          dBHomeComponent({
            routeData: {
              title: "Data Browser",
              breadcrumb: { value: "" },
            },
          })
        }
      />
      <AppRoute
        path="/introductory-videos"
        component={() =>
          IntroVidReactComponent({
            routeData: {
              title: "Introductory Videos",
              breadcrumb: { value: "Introductory Videos" },
            },
          })
        }
      />
      <AppRoute
        path="/ehr/:id"
        component={() =>
          EhrViewReactComponent({
            routeData: {
              title: "View Full Results",
              breadcrumb: { value: ":id Domain" },
            },
          })
        }
      />
      <AppRoute
        path="/ehr/:id/:search"
        component={() =>
          EhrViewReactComponent({
            routeData: {
              title: "View Full Results",
              breadcrumb: { value: ":id Domain" },
            },
          })
        }
      />
      <AppRoute
        path="/survey/:id"
        component={() =>
          SurveyViewReactComponent({
            routeData: {
              title: "View Survey Questions and Answers",
              breadcrumb: { value: ":id Domain" },
            },
          })
        }
      />
      <AppRoute
        path="/survey/:id/:search"
        component={() =>
          SurveyViewReactComponent({
            routeData: {
              title: "View Survey Questions and Answers",
              breadcrumb: { value: ":id Domain" },
            },
          })
        }
      />
      <AppRoute
        path="/fitbit"
        component={() =>
          FitbitReactComponent({
            routeData: {
              title: "Fitbit Data",
              breadcrumb: { value: "Fitbit Data" },
            },
          })
        }
      />
      <AppRoute
        path="/fitbit/:search"
        component={() =>
          FitbitReactComponent({
            routeData: {
              title: "Fitbit Data",
              breadcrumb: { value: "Fitbit Data" },
            },
          })
        }
      />
      <AppRoute
        path="/variants"
        component={() =>
          GenomicViewComponent({
            routeData: {
              title: "SNV/Indel Variants",
              breadcrumb: { value: "SNV/Indel Variants" },
            },
          })
        }
      />
      <AppRoute
        path="/variants/:search"
        component={() =>
          GenomicViewComponent({
            routeData: {
              title: "SNVIndel Variants",
              breadcrumb: { value: "SNV/Indel Variants" },
            },
          })
        }
      />
      <AppRoute
        path="/physical-measurements"
        component={() =>
          PMReactComponent({
            routeData: {
              title: "Physical Measurements",
              breadcrumb: { value: "physical measurements" },
            },
          })
        }
      />
      <AppRoute
        path="/physical-measurements/:search"
        component={() =>
          PMReactComponent({
            routeData: {
              title: "Physical Measurements",
              breadcrumb: { value: "physical measurements" },
            },
          })
        }
      />
    </AppRouter>
  );
};

@AComponent({
  template: '<div #root style="display: inline;"></div>',
})
export class AppRouting extends BaseReactWrapper {
  constructor() {
    super(AppRoutingComponent, []);
  }
}
