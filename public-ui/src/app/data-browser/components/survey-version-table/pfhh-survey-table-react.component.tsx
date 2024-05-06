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
    margin-top: -1rem;
}

.version-box-header,.version-box-row {
    display: grid;
    grid-template-columns: 60% 40%;
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
    const fhh_survey_pdf_link_spanish = '/assets/surveys/Family_Health_History_Survey_Spanish.pdf';
    const pmh_survey_pdf_link = '/assets/surveys/Personal_Medical_History_Survey_English.pdf';
    const pmh_survey_pdf_link_spanish = '/assets/surveys/Personal_Medical_History_Survey_Spanish.pdf';
    const pafhh_survey_pdf_link = '/assets/surveys/Survey_PaFHH_Eng_Src.pdf';
    const pafhh_survey_pdf_link_spanish = '/assets/surveys/Survey_PaFHH_spn_Src.pdf';
    const {questionCount, participantCount} = this.props;

    console.log(questionCount);

    return (
      <div className="version-box-container">
        <style>{cssStyles}</style>
        <br />
        <div className="version-box">
          <div className="version-box-header">
            <div className="version-box-item">Survey</div>
            <div className="version-box-item">Download PDF</div>
          </div>
          <div className="version-box-body">
          <div className="version-box-row">
            <span className="version-box-item">Personal and Family Health History</span>
            <span className="version-box-item">
                      <a href={pafhh_survey_pdf_link} download>
                        English
                      </a>{" "}|{" "}
                      <a href={pafhh_survey_pdf_link_spanish} download>
                        Spanish
                      </a>
            </span>
          </div>
          <div className="version-box-row">
            <span className="version-box-item">Personal Medical History</span>
            <span className="version-box-item">
                      <a href={pmh_survey_pdf_link} download>
                        English
                      </a>{" "}|{" "}
                      <a href={pmh_survey_pdf_link_spanish} download>
                        Spanish
                      </a>
            </span>
          </div>
          <div className="version-box-row">
            <span className="version-box-item">Family Health History</span>
            <span className="version-box-item">
                      <a href={fhh_survey_pdf_link} download>
                        English
                      </a>{" "}|{" "}
                      <a href={fhh_survey_pdf_link_spanish} download>
                        Spanish
                      </a>
            </span>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

