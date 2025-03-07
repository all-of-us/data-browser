import * as React from "react";

import { Component, Input } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { reactStyles } from "app/utils";

const css = `
.ok-btn {
    padding: 1rem 2rem;
    color: #f9f9fa;
    text-transform: uppercase;
    border-radius: 0.3rem;
    background: #816492;
    float: right;
}

.ok-btn:hover {
    background: #262262;
    color: #fff;
  }
    `;

const styles = reactStyles({
  dataStatement: {
    width: "100%",
    height: "100%",
    position: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 115,
    fontWeight: 700,
    color: "#302c71",
  },
  cardTitle: {
    fontSze: "1em",
    textAign: "left",
    paddingBottom: "1em",
    fontWeight: "bold",
    color: "#302c71",
  },
  card: {
    width: "contain",
    height: "contain",
    margin: "15%",
    background: "white",
    position: "relative",
    padding: "1rem",
  },
  close: {
    position: "absolute",
    right: "1rem",
    top: ".5rem",
    fontSize: "1.5em",
  },
  btnContainer: {
    width: "100%",
    position: "relative",
    padding: "1rem",
    marginTop: "1.5rem",
  },
  disclaimerBtn: {
    position: "absolute",
    right: "0",
    color: "white",
    padding: "1em 2.5em",
    background: "#262262",
    border: "none",
  },
  /* covid disclaimer */
  copeStatement: {
    fontSize: "0.8em",
  },
  copeStatementBody: {
    paddingBottom: "1rem",
    display: "inline-block",
  },
  copeStatementBox: {
    display: "inline-block",
    background: "#dae6ed",
    borderRadius: "3px",
    padding: "1rem",
  },
});

const helptexts = {
  HomeViewPopup: {
    title: "PUBLIC DATA USE STATEMENT",
    statement: (
      <div>
        <i>All of Us</i> Research Program data are not representative of the
        population of the United States. If you present, publish, or distribute{" "}
        <i>All of Us</i> data, please include the following disclaimer:
        <br /> "The <i>All of Us</i> Research Program includes a
        demographically, geographically, and medically diverse group of
        participants, however, it is not a representative sample of the
        population of the United States. Enrollment in the <i>All of Us</i>{" "}
        Research program is open to all who choose to participate, and the
        program is committed to engaging with and encouraging participation of
        minority groups that are historically underrepresented in biomedical
        research."{" "}
      </div>
    ),
  },
  EhrViewPopUp: {
    title: "DATA DISCLAIMER",
    statement: (
      <div>
        The <i>All of Us</i> Research Program includes a demographically,
        geographically, and medically diverse group of participants, however, it
        is not a representative sample of the population of the United States.
        Enrollment in the <i>All of Us</i> Research program is open to all who
        choose to participate, and the program is committed to engaging with and
        encouraging participation of minority groups that are historically
        underrepresented in biomedical research.{" "}
      </div>
    ),
  },
  CopePopUp: {
    title: "COvid-19 Participant Experience (COPE) survey",
    statement: (
      <div>
        <div style={styles.copeStatement}>
          <span style={styles.copeStatementBody}>
            This optional survey was released to participants for completion at
            multiple time points during the COVID-19 pandemic. As a result, a
            participant may have multiple data points if they completed more
            than one survey.{" "}
          </span>{" "}
          <span style={styles.copeStatementBody}>
            This survey has multiple versions. Even though most of the content
            is consistent between versions, some questions were modified.{" "}
          </span>{" "}
          <span style={styles.copeStatementBox}>
            <strong>Please Note:</strong>
            <br /> While these aggregate data are available in the Data Browser
            tool, to protect participant privacy, only select data will be
            available in the Registered Tier dataset (i.e., data describing
            COVID positive status will not be made available){" "}
          </span>{" "}
        </div>{" "}
      </div>
    ),
  },
};

export const PopUpReactComponent = (props) => {
  return (
    <React.Fragment>
      <style>{css}</style>
      <div style={styles.dataStatement}>
        <div style={styles.card}>
          <div onClick={props.onClose} style={styles.close}>
            x
          </div>
          <h2 style={styles.cardTitle}>{helptexts[props.helpText].title}</h2>
          <div>{helptexts[props.helpText].statement}</div>
          <div style={styles.btnContainer}>
            <button onClick={props.onClose} className="ok-btn">
              OK
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

@Component({
  selector: "app-popup-react",
  template: `<span #root></span>`,
})
export class PopUpWrapperComponent extends BaseReactWrapper {
  @Input() public helpText: string;
  @Input("onClose") onClose: Function;

  constructor() {
    super(PopUpReactComponent, ["helpText", "onClose"]);
  }
}
