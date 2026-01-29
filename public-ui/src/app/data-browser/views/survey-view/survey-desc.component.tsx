import * as React from "react";

import { Component, Input } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { reactStyles } from "app/utils";

const styles = reactStyles({
  pageHeader: {
    paddingTop: "18px",
    paddingBottom: "0",
    paddingLeft: "18px",
    paddingRight: "18px",
  },
  title: {
    fontSize: "35px",
    marginBottom: "0",
    fontFamily: "gothamBook",
  },
  titleContainer: {
    width: "100%",
    paddingRight: "18px",
    margin: "0",
    lineHeight: "1em",
  },
  disclaimerBtn: {
    padding: "0.5rem",
    marginTop: "1rem",
  },
  descContainer: {
    flexWrap: "wrap",
    alignItems: "center",
  },
});

const cssStyles = `
.disclaimer-btn {
  padding: 1rem 2rem;
  color: #f9f9fa;
  text-transform: uppercase;
  border-radius: 0.3rem;
  background: #816492;
}
.disclaimer-btn:hover {
  background: #262262;
  color: #fff;
}
.body-default,
p {
  font-family: "GothamBook", "Arial", sans-serif;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  font-size: 16px;
  letter-spacing: normal;
  text-align: left;
  color: #262262;
}
.help-text {
  font-size: 16px;
}
.survey-desc {
  padding-top: 1%;
}
.survey-note {
  font-size: 16px;
  align-items: center;
  margin: 5px;
}
.bold-note-heading {
    font-family: GothamBold, Arial, sans-serif;
    font-weight: bold;
}
`;

export const SurveyDescReactComponent = (props) => {
  return (
    <React.Fragment>
      <style>{cssStyles}</style>
      <div className="page-header" style={styles.pageHeader}>
        <div className="title-container" style={styles.titleContainer}>
          <h1 style={styles.title}> {props.surveyName} </h1>
          {props.isCopeSurvey ? (
            <p className="body-default help-text survey-desc">
              This optional survey was released to participants for completion
              at multiple time points during the COVID-19 pandemic. As a result,
              a participant may have multiple data points if they completed more
              than one survey. Even though most of the content is consistent
              between survey versions, some questions were modified.
            </p>
          ) : null}
          <div className="desc-container" style={styles.descContainer}>
            <p className="body-default help-text survey-desc">
              {props.surveyDescription} Survey questions appear in the order in
              which participants took the survey.
            </p>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

@Component({
  selector: "app-survey-desc",
  template: `<div #root></div>`,
})
export class SurveyDescWrapperComponent extends BaseReactWrapper {
  @Input() public surveyName: string;
  @Input() public isCopeSurvey: boolean;
  @Input() public surveyDescription: string;
  constructor() {
    super(SurveyDescReactComponent, [
      "surveyName",
      "isCopeSurvey",
      "surveyDescription",
    ]);
  }
}