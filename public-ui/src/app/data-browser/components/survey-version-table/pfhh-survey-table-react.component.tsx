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
}

export class PfhhSurveyTableReactComponent extends React.Component<
  Props,
  {}
> {
  constructor(props: Props) {
    super(props);
  }

  render() {
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
            <span className="version-box-item">Test</span>
            <span className="version-box-item">Test</span>
            <span className="version-box-item">Test</span>
          </div>
          <div className="version-box-row">
            <span className="version-box-item">Personal Medical History</span>
            <span className="version-box-item">Test</span>
            <span className="version-box-item">Test</span>
            <span className="version-box-item">Test</span>
          </div>
          <div className="version-box-row">
            <span className="version-box-item">Family Health History</span>
            <span className="version-box-item">Test</span>
            <span className="version-box-item">Test</span>
            <span className="version-box-item">Test</span>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

