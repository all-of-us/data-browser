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
}

.version-box{
    border:1px solid #cccccc;
    border-radius: 3px;
}

.version-box-header,.version-box-row {
    display: grid;
    grid-template-columns: 40% 17.5% 17.5% 25%;
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
    questionCount: number;
    participantCount: number;
}

export class PfhhSurveyTableReactComponent extends React.Component<
  Props,
  {
    questionCount: number;
    participantCount: number;
  }
> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const fhh_survey_pdf_link = '/assets/surveys/Family_Health_History_Survey_English.pdf';
    const pmh_survey_pdf_link = '/assets/surveys/Personal_Medical_History_Survey_English.pdf';
    const pafhh_survey_pdf_link = '/assets/surveys/Survey_PaFHH_Eng_Src.pdf';
    const {questionCount, participantCount} = this.props;
    return (
      <div className="version-box-container">
        <style>{cssStyles}</style>
        <h5>
          <strong>Survey versions</strong>
        </h5>
        <br />
        <div className="version-box">
          <div className="version-box-header">
            <div className="version-box-item">Survey</div>
            <div className="version-box-item">Participants</div>
            <div className="version-box-item">Questions</div>
            <div className="version-box-item">Download PDF</div>
          </div>
          <div className="version-box-body">
          <div className="version-box-row">
            <span className="version-box-item">Personal and Family Health History</span>
            <span className="version-box-item">{participantCount}</span>
            <span className="version-box-item">{questionCount}</span>
            <span className="version-box-item">
                      <a href={pafhh_survey_pdf_link} download>
                        <ClrIcon
                          shape="file"
                          className="is-solid"
                          style={{ width: 18, height: 18 }}
                        />
                        Survey as PDF
                      </a>{" "}
            </span>
          </div>
          <div className="version-box-row">
            <span className="version-box-item">Personal Medical History</span>
            <span className="version-box-item">142100</span>
            <span className="version-box-item">465</span>
            <span className="version-box-item">
                      <a href={pmh_survey_pdf_link} download>
                        <ClrIcon
                          shape="file"
                          className="is-solid"
                          style={{ width: 18, height: 18 }}
                        />
                        Survey as PDF
                      </a>{" "}
            </span>
          </div>
          <div className="version-box-row">
            <span className="version-box-item">Family Health History</span>
            <span className="version-box-item">145620</span>
            <span className="version-box-item">104</span>
            <span className="version-box-item">
                      <a href={fhh_survey_pdf_link} download>
                        <ClrIcon
                          shape="file"
                          className="is-solid"
                          style={{ width: 18, height: 18 }}
                        />
                        Survey as PDF
                      </a>{" "}
            </span>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

