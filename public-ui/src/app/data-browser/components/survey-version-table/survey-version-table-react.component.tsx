import * as React from "react";

import { Component, Input } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { ClrIcon } from "app/utils/clr-icon";

const cssStyles = `
strong {
    font-family: GothamBook, Arial, sans-serif;
}

.version-box-container  {
    width:100%;
    font-size: .8em;
    display:flex;
    justify-content: flex-end;
    
}

.version-box{
    border:1px solid #cccccc;
    border-radius: 3px;
    margin-top: -1rem;
    width:70%
}

.version-box-header,.version-box-row {
    display: grid;
    grid-template-columns: 53% 47%;
    /* justify-content: space-around; */
    width:100%;
}
.version-box-row {
    border-top: 1px solid #cccccc;
}

.version-box-header {
    background: #dae6ed;
}

.version-box-header > .version-box-item {
    font-family: GothamBold;
    text-align: center;
}

div.version-box-item:nth-child(1),div.version-box-row span:nth-child(1){
  border-right:#cccccc 1px solid;
}
.version-box-body{
    overflow-y: auto;
}
.version-box-item{
    font-weight: bold;
    padding:.5em;
}
`;

const containerElementName = "root";

interface Props {
  // surveyInfo: any;
  surveyVersions: Array<any>;
}

export class SurveyVersionTableReactComponent extends React.Component<
  Props,
  {}
> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { surveyVersions } = this.props;

    return (
      <div className="version-box-container">
        <style>{cssStyles}</style>
        <br />
        <div className="version-box">
          <div className="version-box-header">
            <div className="version-box-item">Survey Version</div>
            <div className="version-box-item">PDF</div>
          </div>
          <div className="version-box-body">
            {!!surveyVersions &&
              surveyVersions.map((survey) => {
                switch (survey.monthName) {
                  case "New Year":
                    survey.pdfLink = survey.pdfLink.replace(" ", "_");
                    break;
                  case "Nov":
                    survey.monthName = "November";
                    break;
                  case "Dec":
                    survey.monthName = "December";
                    break;
                  case "Feb":
                    survey.monthName = "February";
                    break;
                }
                return (
                  <div className="version-box-row" key={survey.monthName}>
                    <span className="version-box-item">
                      {survey.monthName} {survey.year}
                    </span>
                    <span
                      className="version-box-item"
                      style={{ textAlign: "center" }}
                    >
                      <a href={survey.pdfLink} download>
                        English
                      </a>{" "}
                      |{" "}
                      <a href={survey.pdfLinkSpanish} download>
                        Spanish
                      </a>
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}

@Component({
  standalone: false,
  selector: "app-survey-version-table-react",
  template: `<span #${containerElementName}></span>`,
})
export class SurveyVersionWrapperComponent extends BaseReactWrapper {
  @Input() public surveyVersions;
  constructor() {
    super(SurveyVersionTableReactComponent, ["surveyVersions"]);
  }
}
