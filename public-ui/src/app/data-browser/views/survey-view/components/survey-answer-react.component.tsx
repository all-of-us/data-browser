import * as React from "react";

import { Component, Input, ViewEncapsulation } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { SurveyAnswerChartReactComponent } from "app/data-browser/charts/chart-survey-answers/react-survey-answer-chart.component";
import {
  AGE_STRATUM_MAP,
  GENDER_STRATUM_MAP,
} from "app/data-browser/charts/react-base-chart/base-chart.service";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { SurveyChartReactComponent } from "app/data-browser/views/survey-chart/survey-chart-react.component";
import { dataBrowserApi } from "app/services/swagger-fetch-clients";
import { ClrIcon } from "app/utils/clr-icon";
import { countPercentage } from "app/utils/survey-utils";
import { LoadingDots } from "app/utils/spinner";
import { environment } from "environments/environment";

const styleCss = `
    .survey-tbl {
        width: 100%;
    }
    .survey-tbl *{
        font-family: "GothamBook", "Arial", sans-serif,
        font-size: 1em
    }
    .survey-tbl-r.survey-tbl-head {
        /* padding-bottom: 0; */
        background: rgba(218, 230, 237, 0.7);
        border: #cccccc 1px solid;
        border-bottom: none;
    }
    .survey-sub-tbl .survey-tbl-exp-r:last-of-type {
        border-bottom: none;
    }
    .survey-row-icon {
        height: 1.5rem;
        width: 1.5rem;
        color: #2691D0;
      }
    .sub-question-text {
        margin-top: 1em;
        text-align: left;
        font-weight: bold;
        margin-left: 1em;
        font-family: GothamBold, Arial, Helvetica, sans-serif;
    }
    .non-bold-text {
      font-weight: normal !important;
      margin-top: 1em;
      text-align: left;
    }
    .survey-row-expanded {
        border-left: #cccccc 1px solid;
        border-right: #cccccc 1px solid;
        background: #f6f6f8;
    }
    .active-row {
        background: #f6f6f8;
        height: 2.5rem;
    }
    .sub-table-1 .sub-question-text, .sub-table-2 .sub-question-text {
        padding-top: 1rem;
    }

    .survey-sub-table {
        padding-left: 2em;
        padding-bottom: 1em;
        width: 98%;
    }
`;

interface SurveyRowProps {
  question: any;
  answer: any;
  surveyName: string;
  surveyConceptId: number;
  questionConceptId: number;
  answerConceptId: number;
  answerValueString: string;
  hasSubQuestions: string;
  countValue: number;
  countPercent: number;
  isCopeSurvey: boolean;
  surveyVersions: any;
  surveyCountAnalysis: any;
  searchTerm: string;
  participantCount: number;
  level: number;
}

interface SurveyRowState {
  drawerOpen: boolean;
  subQuestions: Array<any>;
  nextLevel: number;
  drawerLoading: boolean;
}

const SurveyAnswerRowComponent = class extends React.Component<
  SurveyRowProps,
  SurveyRowState
> {
  constructor(props: SurveyRowProps) {
    super(props);

    this.state = {
      drawerLoading: false,
      drawerOpen: false,
      subQuestions: [],
      nextLevel: props.hasSubQuestions === "1" ? props.level + 1 : undefined,
    };
  }

  openDrawer(answerValueString, path) {
    this.setState({
      drawerOpen: !this.state.drawerOpen,
    });
    if (this.props.hasSubQuestions === "1" && !this.state.subQuestions.length) {
      this.getSubQuestions(path);
    } else {
      this.processResults([this.props.question]);
    }
  }

  getSubQuestions(path: string) {
    this.setState({
      drawerLoading: true,
    });
    dataBrowserApi()
      .getSubQuestions(
        this.props.surveyConceptId,
        this.props.questionConceptId,
        this.props.answerConceptId,
        this.state.nextLevel,
        path
      )
      .then((results) => {
        this.setState({
          subQuestions: this.processResults(results.questions.items),
          drawerLoading: false
        });
      })
      .catch((e) => console.log(e, "error"));
  }

  processResults(questions: Array<any>) {
    const { countValue } = this.props;
    this.setState({
      drawerLoading: true
    });
    questions.forEach((q) => {
    console.log(q);
      q.countAnalysis.results = q.countAnalysis.results.filter(
        (a) => a.stratum6 === q.path
      );
      q.genderAnalysis.results = q.genderAnalysis.results.filter(
        (a) => a.stratum6 === q.path
      );
      q.ageAnalysis.results = q.ageAnalysis.results.filter(
        (a) => a.stratum6 === q.path
      );
      q.combinedAgeSexAnalysis.results = q.combinedAgeSexAnalysis.results.filter(
        (a) => a.stratum6 === q.path
      );
      if (q.versionAnalysis && q.versionAnalysis.results) {
        q.versionAnalysis.results = q.versionAnalysis.results.filter(
          (a) => a.stratum6 === q.path
        );
      }
      q.countAnalysis.results.sort((a1, a2) => {
        if (a1.countValue > a2.countValue) {
          return -1;
        }
        if (a1.countValue < a2.countValue) {
          return 1;
        }
        return 0;
      });
      q.countAnalysis.results.forEach((aCount, i) => {
        if (aCount.stratum7 && aCount.stratum7 === "1") {
          aCount.subQuestionFetchComplete = false;
        }
        this.addMissingResults(q, aCount);
        return aCount;
      });
      return q;
    });
    questions.sort((a, b) => a.id - b.id);
    this.setState({
      drawerLoading: false
    });
    return questions;
  }

  public addMissingResults(q: any, a: any) {
    a.countPercent = countPercentage(a.countValue, this.props.countValue);
    if (q.genderAnalysis) {
      this.addMissingAnalysisResults(
        q.genderAnalysis,
        q.genderAnalysis.results.filter(
          (r) => r.stratum3 !== null && r.stratum3 === a.stratum3
        )
      );
    }
    if (q.ageAnalysis) {
      this.addMissingAnalysisResults(
        q.ageAnalysis,
        q.ageAnalysis.results.filter(
          (r) => r.stratum3 !== null && r.stratum3 === a.stratum3
        )
      );
    }
    if (q.combinedAgeGenderAnalysis) {
      this.addMissingAnalysisResults(
        q.combinedAgeGenderAnalysis,
        q.combinedAgeGenderAnalysis.results.filter(
          (r) => r.stratum3 !== null && r.stratum3 === a.stratum3
        )
      );
    }
  }

    public addMissingAnalysisResults(analysis: any, results: any) {
      const fullGenderStratums = ["8507", "8532", "0"];
      const fullAgeStratums = ["2", "3", "4", "5", "6", "7", "8", "9"];

      const uniquePairs = new Set<string>();

      for (const result of results) {
        if (analysis.analysisId === 3115) {
          const key = `${result.stratum5}|${result.stratum6}`;
          uniquePairs.add(key);
        } else {
          const strat = result.stratum5;
          if (!uniquePairs.has(strat)) {
            uniquePairs.add(strat);
          }
        }
      }

      if (analysis.analysisId === 3115) {
        for (const age of fullAgeStratums) {
          for (const gender of fullGenderStratums) {
            const key = `${age}|${gender}`;
            if (!uniquePairs.has(key) && results.length > 0) {
              const base = results[0];
              const missingResult = {
                analysisId: 3115,
                countValue: 20,
                countPercent: countPercentage(20, this.props.countValue),
                stratum1: base.stratum1,
                stratum2: base.stratum2,
                stratum3: base.stratum3,
                stratum4: base.stratum4,
                stratum5: age,
                stratum6: gender,
                analysisStratumName: `${AGE_STRATUM_MAP[age]} | ${GENDER_STRATUM_MAP[gender]}`,
              };
              analysis.results.push(missingResult);
            }
          }
        }
      } else {
        const fullStratums =
          analysis.analysisId === 3111 ? fullGenderStratums : fullAgeStratums;
        for (const missingStratum of fullStratums) {
          if (!uniquePairs.has(missingStratum) && results.length > 0) {
            const base = results[0];
            const missingResult = {
              analysisId: analysis.analysisId,
              countValue: 20,
              countPercent: countPercentage(20, this.props.countValue),
              stratum1: base.stratum1,
              stratum2: base.stratum2,
              stratum3: base.stratum3,
              stratum4: base.stratum4,
              stratum5: missingStratum,
              stratum6: base.stratum6,
              analysisStratumName:
                analysis.analysisId === 3111
                  ? GENDER_STRATUM_MAP[missingStratum]
                  : AGE_STRATUM_MAP[missingStratum],
            };
            analysis.results.push(missingResult);
          }
        }
      }
    }


  render() {
    const {
      answerConceptId,
      answerValueString,
      hasSubQuestions,
      countValue,
      countPercent,
      isCopeSurvey,
      question,
      answer,
      surveyName,
      surveyVersions,
      surveyCountAnalysis,
      searchTerm,
      surveyConceptId,
    } = this.props;
    const { drawerOpen, subQuestions, drawerLoading } = this.state;
    const graphButtons = ["Sex Assigned at Birth", "Age When Survey Was Taken", "Age + Sex"];
    if (isCopeSurvey) {
      graphButtons.unshift("Survey Versions");
    }
    if (environment.heatmap)  {
      graphButtons.push("Map");
    }
    const participantPercentage = (
      (this.props.countValue / this.props.participantCount) *
      100
    ).toFixed(2);
    const countString = countValue
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (
      <React.Fragment>
        <div
          className={
            drawerOpen
              ? "active-row survey-tbl-exp-r survey-tbl-r"
              : "survey-tbl-exp-r survey-tbl-r"
          }
          onClick={() => this.openDrawer(answerValueString, question.path)}
        >
          <div className="survey-tbl-d first display-body info-text survey-answer-level-1">
            {answerValueString}
          </div>
          <div className="survey-tbl-r-group">
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
              {isCopeSurvey ? (
                <React.Fragment></React.Fragment>
              ) : (
                answerConceptId
              )}
            </div>
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
              {isCopeSurvey ? (
                <React.Fragment></React.Fragment>
              ) : countValue > 20 ? (
                countString
              ) : (
                <React.Fragment>&le; {countString} </React.Fragment>
              )}
            </div>
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
              {isCopeSurvey
                ? answerConceptId
                : countPercent
                  ? countPercent.toFixed(2)
                  : participantPercentage}
              {isCopeSurvey ? null : "%"}
            </div>
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
              {hasSubQuestions === "1" ? (
                drawerLoading ? (
                  <div style={{ marginLeft: "-1rem" }}>
                  <LoadingDots />
                  </div>
                ) : (
                  <ClrIcon
                    shape="caret"
                    className="survey-row-icon"
                    style={{ color: "#216fb4" }}
                    dir={drawerOpen ? "down" : "right"}
                  />
                )
              ) : answerValueString !== "Did not answer" ? (
              <ClrIcon
                className={
                  drawerOpen ? "is-solid survey-row-icon" : "survey-row-icon"
                }
                shape="bar-chart"
              />
              ) : null}
            </div>
          </div>
        </div>
        {drawerOpen && (
          <div className="survey-row-expanded">
            {hasSubQuestions === "1" && subQuestions ? (
              subQuestions.map((sq, index) => {
                return (
                  <React.Fragment key={index + "subquestion"}>
                    <h6>
                      <ClrIcon shape="child-arrow" />
                      <span className="sub-question-text">
                        {sq.conceptName}
                      </span>{" "}
                      <span className="non-bold-text">({sq.conceptId})</span>
                    </h6>
                    <div className="survey-sub-table">
                      {/* tslint:disable-next-line: no-use-before-declare */}
                      <SurveyAnswerReactComponent
                        level={this.state.nextLevel}
                        participantCount={countValue}
                        question={sq}
                        isCopeSurvey={isCopeSurvey}
                        surveyName={surveyName}
                        surveyVersions={surveyVersions}
                        surveyCountAnalysis={surveyCountAnalysis}
                        searchTerm={searchTerm}
                      />
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <SurveyChartReactComponent
                graphButtons={graphButtons}
                isCopeSurvey={isCopeSurvey}
                question={question}
                answer={answer}
                selectedResult={answer}
                surveyName={surveyName}
                versionAnalysis={surveyVersions}
                surveyCountAnalysis={surveyCountAnalysis}
                searchTerm={searchTerm}
                surveyConceptId={surveyConceptId}
              ></SurveyChartReactComponent>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
};

interface Props {
  isCopeSurvey: boolean;
  question: any;
  participantCount: number;
  level: number;
  surveyName: string;
  surveyVersions: any;
  surveyCountAnalysis: any;
  searchTerm: any;
}

export class SurveyAnswerReactComponent extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      isCopeSurvey,
      question,
      participantCount,
      level,
      surveyName,
      surveyVersions,
      surveyCountAnalysis,
      searchTerm,
    } = this.props;
    return (
      <React.Fragment>
        <style>{styleCss}</style>
        {isCopeSurvey && (
          <SurveyAnswerChartReactComponent
            countAnalysis={question.countAnalysis.results}
            versionAnalysis={question.versionAnalysis.results}
            surveyVersions={surveyVersions}
          />
        )}
        <div className="survey-tbl">
          <div className="survey-tbl-r survey-tbl-head">
            <div className="info-text first survey-tbl-d">Answer</div>
            <div className="survey-tbl-r-group survey-tbl-r-group-style ">
              <div className="info-text survey-tbl-d display-body">
                {isCopeSurvey ? null : (
                  <span>
                    Concept Code
                    <TooltipReactComponent
                      tooltipKey="conceptCodeHelpText"
                      label="test"
                      searchTerm="test"
                      action="Survey Page Tooltip"
                    />
                  </span>
                )}
              </div>
              <div className="info-text survey-tbl-d display-body">
                {isCopeSurvey ? null : (
                  <span>
                    Participant Count
                    <TooltipReactComponent
                      tooltipKey="surveyParticipantCountHelpText"
                      label="test"
                      searchTerm="test"
                      action="Survey Page Tooltip"
                    />
                  </span>
                )}
              </div>
              <div className="info-text survey-tbl-d display-body">
                {isCopeSurvey ? (
                  <span>
                    Concept Code
                    <TooltipReactComponent
                      tooltipKey="conceptCodeHelpText"
                      label="test"
                      searchTerm="test"
                      action="Survey Page Tooltip"
                    />
                  </span>
                ) : (
                  <span>
                    {!!participantCount
                      ? `% Answered out of ${participantCount}`
                      : "% Answered"}
                  </span>
                )}
              </div>
              <div className="info-text survey-tbl-d display-body">
                {isCopeSurvey ? null : <React.Fragment></React.Fragment>}
              </div>
            </div>
          </div>

          {question.countAnalysis &&
            question.countAnalysis.results.map((answer, index) => {
              const answerCleaned = {
                surveyConceptId: answer.stratum1,
                questionConceptId: answer.stratum2,
                answerConceptId: answer.stratum3,
                answerValueString: answer.stratum4,
                hasSubQuestions: answer.stratum7,
                countValue: answer.countValue,
                countPercent: answer.countPercent,
              };
              const key = "answer" + index;
              return (
                <SurveyAnswerRowComponent
                  level={level}
                  participantCount={participantCount}
                  key={key}
                  question={question}
                  answer={answer}
                  surveyName={surveyName}
                  isCopeSurvey={isCopeSurvey}
                  surveyVersions={surveyVersions}
                  surveyCountAnalysis={surveyCountAnalysis}
                  searchTerm={searchTerm}
                  {...answerCleaned}
                />
              );
            })}
        </div>
      </React.Fragment>
    );
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: "app-survey-answer-react",
  template: `<span #root></span>`,
  styleUrls: ["../../../../styles/template.css"],
  encapsulation: ViewEncapsulation.None,
})
export class SurveyAnswerWrapperComponent extends BaseReactWrapper {
  @Input() isCopeSurvey: boolean;
  @Input() question: any;
  @Input() level: number;
  @Input() surveyName: string;
  @Input() surveyVersions: any;
  @Input() surveyCountAnalysis: any;
  @Input() searchTerm: any;
  constructor() {
    super(SurveyAnswerReactComponent, [
      "isCopeSurvey",
      "question",
      "level",
      "surveyName",
      "surveyVersions",
      "surveyCountAnalysis",
      "searchTerm",
    ]);
  }
}
