import * as React from "react";
import _ from "lodash";

import { environment } from "environments/environment";
import { withRouteData } from "app/components/app-router";
import { NoResultSearchComponent } from "app/components/db-no-results/no-results-search.component";
import { SurveyVersionTableReactComponent } from "app/data-browser/components/survey-version-table/survey-version-table-react.component";
import { PfhhSurveyTableReactComponent } from "app/data-browser/components/survey-version-table/pfhh-survey-table-react.component";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import { SurveyQuestionReactComponent } from "app/data-browser/views/survey-view/components/survey-question-react.component";
import { SurveyDescReactComponent } from "app/data-browser/views/survey-view/survey-desc.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { GraphType } from "app/utils/enum-metadata";
import { triggerEvent } from "app/utils/google_analytics";
import { navigate, navigateByUrl, urlParamsStore } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";
import { Configuration, DataBrowserApi } from "publicGenerated/fetch";

const api = new DataBrowserApi(
  new Configuration({ basePath: environment.publicApiUrl })
);

const styles = reactStyles({
  searchLink: {
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "14px",
    cursor: "pointer"
  },
  dbCard: {
    overflowX: "auto",
    padding: "18px",
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.15)",
  },
  surveyHead: {
    display: "flex",
    position: "relative",
    padding: "0 1rem",
    marginBottom: "calc(18px * 4)",
  },
  results: {
    paddingTop: "36px",
    width: "100%",
    padding: "18px",
  },
  strong: {
    fontFamily: "GothamBook, Arial, sans-serif",
    color: "#302c71",
  },
  searchBarContainer: {
    padding: "18px",
  },
  statLayout: {
    display: "flex",
    width: "80%",
  },
  copeStatLayout: {
    display: "flex",
    flexDirection: "column",
    width: "50%",
    postion: "relative",
    top: "3rem"
  },
  versionTable: {
    width: "70%",
  },
  statContainer: {
    display: "flex",
    flexDirection: "column",
    marginTop: "0",
    fontSize: "70px",
    lineHeight: "0.97em",
    paddingRight: "45px",
  },
  secondaryDisplay: {
    lineHeight: "0.97em",
    fontSize: "0.9em",
  },
  highlight: {
    fontFamily: "GothamBold, Arial, san-serif",
    fontWeight: 700,
    padding: "3px",
  },
  pdfLink: {
    paddingTop: "1rem",
  },
  surveyResults: {
    position: "relative",
  },
  noResults: {
    padding: "1em",
    fontSize: "16px",
    color: "#262262",
    textAlign: "left",
  },
  surveyView: {
    boxSizing: "border-box",
  },
  infoText: {
    marginTop: "0",
    color: "#262262",
  },
});

const surveyStyle = `
.toggle-link, .toggle-link:link, .toggle-link:visited {
    color: #216fb4;
}
.pdf-link a {
  cursor: pointer;
}
.stat-container .secondary-display{
  // margin-bottom:26px;
  margin-bottom:1rem;
  margin-top:0;
}

.topic-text {
        border-top: 1px solid #cccccc;
        font-size: 1.2em;
        font-weight: 500;
        padding-top: 2%;
        padding-bottom: 2%;
}
@media only screen and (max-width: 767px) {
    .stat-container {
        flex-basis: 100%;
    }
}
.question-result {
        border-top: 1px solid #cccccc;
        padding: 9px 0;
        font-size: 0.9em;
        font-family:GothamBook Arial, sans-serif;
        color: #262262;
        width: 100%;
}
.question-result:first-of-type{
    border-top: none;
}
.topic-text:first-of-type{
    border-top: none;
}
.question .body-default {
    padding-bottom: 18px;
}
@media only screen and (max-width: 768px) {
    .survey-head {
        flex-direction: column;
    }
    .cope-stat-layout {
        width: 100%;
        align-items: flex-end;
        flex-direction: row;

    }
    .cope-stat-layout .stat-container {
        padding-right: 0px;
        padding-bottom: 2rem;
    }
    .version-table {
        width: 100%;
    }
    .pdf-link {
        position: absolute;
        right: 0;
        top: 0;
        padding-top: 0;
    }
}
.topic-text + .question-result {
    border-top: none;
}

.question-result ~ .topic-text:first-of-type {
    border-top: 1px solid #cccccc;
}

div {
    display: block;
}
`;

interface State {
  survey: any;
  surveyId: string;
  surveyPdfUrl: any;
  surveyPdfUrlSpanish: any;
  isCopeSurvey: boolean;
  isCombinedPfhh: boolean;
  pfhhQC: number;
  pfhhPC: number;
  searchWord: string;
  surveyVersions: Array<any>;
  showAnswer: {};
  questions: Array<any>;
  loading: boolean;
}

export const SurveyViewReactComponent = withRouteData(
  class extends React.Component<{}, State> {
    search = _.debounce((val) => {
      this.setState({ loading: true }, () => {
        this.fetchSurvey(this.state.surveyId);
      });
      if (val) {
        triggerEvent(
          "surveySearch",
          "Search",
          "Search Inside Survey " + this.state.survey.name,
          "Survey Search",
          val,
          null
        );
      }
      const { id } = urlParamsStore.getValue();
      navigate(["survey", id, val]);
    }, 1000);

    constructor(props: {}) {
      super(props);
      const { search } = urlParamsStore.getValue();
      this.state = {
        isCopeSurvey: false,
        isCombinedPfhh: false,
        pfhhPC: 0,
        pfhhQC: 0,
        survey: null,
        surveyId: urlParamsStore.getValue().id,
        surveyPdfUrl: "",
        surveyPdfUrlSpanish: "",
        searchWord: search,
        showAnswer: {},
        questions: [],
        loading: true,
        surveyVersions: [],
      };
    }

    componentDidMount() {
      this.fetchSurvey(this.state.surveyId);
    }

    fetchSurvey(domain) {
      const { searchWord, surveyId, pfhhQC, pfhhPC } = this.state;
      let fetchDomain = surveyId;
      if (domain && surveyId !== domain) {
        fetchDomain = domain;
      }
      api.getDomainTotals(searchWord, 1, 1).then((data: any) => {
        data.surveyModules.forEach((survey) => {
          if (survey.conceptId === 43529712) {


            this.setState({ pfhhQC: survey.questionCount, pfhhPC: survey.participantCount });
          }
          const surveyRoute =
            survey.conceptId === 43528895
              ? "health-care-access-and-utilization"
              : survey.name.split(" ").join("-").toLowerCase();
          if (surveyRoute.indexOf("(cope)") > -1) {
            if (fetchDomain && surveyRoute.indexOf(fetchDomain) > -1) {
              localStorage.setItem("surveyModule", JSON.stringify(survey));
              this.setSurvey(JSON.stringify(survey));
            }
          } else {
            if (surveyRoute === fetchDomain) {
              localStorage.setItem("surveyModule", JSON.stringify(survey));
              this.setSurvey(JSON.stringify(survey));
            }
          }
        });
      });
    }

    setSurvey(surveyObj) {
      const survey = JSON.parse(surveyObj);
      const surveyConceptId = survey.conceptId;
      const surveyPdfUrl =
        surveyConceptId === 43528895
          ? "/assets/surveys/" +
          "Health Care Access Utilization".split(" ").join("_") +
          ".pdf"
          : surveyConceptId === 1740639
            ? "/assets/surveys/" +
            "Personal_and_Family_Health_History" +
            ".pdf"
            : "/assets/surveys/" + survey.name.split(" ").join("_") + ".pdf";
            const surveyPdfUrlSpanish =
        surveyConceptId === 43528895
          ? "/assets/surveys/" +
          "Health Care Access Utilization".split(" ").join("_") +
          "_Spanish.pdf"
          : surveyConceptId === 1740639
            ? "/assets/surveys/" +
            "Personal_and_Family_Health_History" +
            "_Spanish.pdf"
            : "/assets/surveys/" + survey.name.split(" ").join("_") + "_Spanish.pdf";
      const copeFlag =
        surveyConceptId === 1333342 || surveyConceptId === 765936;
      const combinedPfhhFlag = surveyConceptId === 43529712;
      if (surveyConceptId === 1333342 || surveyConceptId === 765936) {
        const surveyVersions = [];
        api
          .getSurveyVersionCounts(surveyConceptId.toString())
          .then((result) => {
            result.analyses.items.map((r) =>
              r.results.map((item, i) => {
                if (item.analysisId === 3400) {
                  surveyVersions.push({
                    monthName: item.stratum3,
                    year: item.stratum4,
                    versionNum: item.stratum5,
                    monthNum: item.stratum2.split("/")[0],
                    participants: item.countValue,
                    numberOfQuestion: "",
                    pdfLink:
                      "/assets/surveys/" +
                      "COPE_survey_" +
                      item.stratum3.split("/")[0].replace("/", "_") +
                      "_" +
                      item.stratum4 +
                      "_English.pdf",
                  });
                } else if (item.analysisId === 3401) {
                  const matchingSurveyVersionAnalysisRow =
                    surveyVersions.filter(
                      (sv) => sv.monthName === item.stratum3
                    );
                  if (
                    matchingSurveyVersionAnalysisRow &&
                    matchingSurveyVersionAnalysisRow.length > 0
                  ) {
                    matchingSurveyVersionAnalysisRow[0].numberOfQuestion =
                      item.countValue;
                  }
                }
              })
            );
            surveyVersions.sort((a1, a2) => {
              const a = new Date(a1.year, a1.monthNum.split("/")[0], 1);
              const b = new Date(a2.year, a2.monthNum.split("/")[0], 1);
              return a.valueOf() - b.valueOf();
            });
            this.setState({ surveyVersions: surveyVersions });
          });
      }
      this.setState(
        {
          survey: survey,
          surveyPdfUrl: surveyPdfUrl,
          surveyPdfUrlSpanish: surveyPdfUrlSpanish,
          isCopeSurvey: copeFlag,
          isCombinedPfhh: combinedPfhhFlag,
        },
        () => {
          this.getSurvey();
        }
      );
    }

    handleChange(val) {
      this.setState({ searchWord: val });
      this.search(val);
    }

    getSurvey() {
      const { survey, searchWord } = this.state;
      api
        .getSurveyQuestions(survey.conceptId.toString(), searchWord)
        .then((x: any) => {
          this.processSurveyQuestions(x);
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loading: false });
        });
    }

    processSurveyQuestions(results: any) {
      const survey = results.survey;
      const questions = results.questions.items;
      this.setDefaults(questions, 0, survey);
    }

    setDefaults(surveyQuestions: any, level: any, survey) {
      const { isCopeSurvey } = this.state;
      for (const q of surveyQuestions) {
        q.actualQuestionNumber = q.questionOrderNumber;
        if (isCopeSurvey) {
          q.graphToShow = GraphType.SurveyVersion;
          q.selectedAnalysis = q.versionAnalysis;
        } else {
          q.graphToShow = GraphType.BiologicalSex;
          q.selectedAnalysis = q.genderAnalysis;
        }
        q.graphDataToShow = "Count";
        q.resultFetchComplete = false;
      }
      surveyQuestions.sort((a1, a2) => {
        if (a1.actualQuestionNumber < a2.actualQuestionNumber) {
          return -1;
        }
        if (a1.actualQuestionNumber > a2.actualQuestionNumber) {
          return 1;
        }
        return 0;
      });
      this.setState({
        questions: surveyQuestions,
        survey: survey,
        loading: false,
      });
    }

    backToMain() {
      navigateByUrl("");
    }

    render() {
      const {
        loading,
        searchWord,
        isCopeSurvey,
        isCombinedPfhh,
        pfhhPC,
        pfhhQC,
        survey,
        questions,
        surveyVersions,
        surveyPdfUrl,
        surveyPdfUrlSpanish
      } = this.state;
      const statClass = (isCopeSurvey || isCombinedPfhh) ? "cope-stat-layout" : "stat-layout";
      const statStyle = (isCopeSurvey || isCombinedPfhh)
        ? styles.copeStatLayout
        : styles.statLayout;
      const matchingQuestions = questions.filter((question) =>
        question.type.toLowerCase().includes("question")
      );
      console.log(survey);
      return (
        <React.Fragment>
          <style>{surveyStyle}</style>
          <div className="survey-view" style={styles.surveyView}>
            {survey && (
              <SurveyDescReactComponent
                surveyName={survey.name}
                isCopeSurvey={isCopeSurvey}
                surveyDescription={survey.description}
              />
            )}
            <div
              className="search-bar-container"
              style={styles.searchBarContainer}
            >
              <SearchComponent
                value={searchWord || ""}
                searchTitle=""
                domain="survey"
                onChange={(val) => this.handleChange(val)}
                onClear={() => this.handleChange("")}
                placeholderText="Keyword Search"
              />
            </div>
            {loading && <Spinner />}
            {survey && (
              <section className="results" style={styles.results}>
                <a
                  className="btn btn-link btn-sm main-search-link"
                  style={styles.searchLink}
                  onClick={() => this.backToMain()}
                >
                  &lt; Back to main search{" "}
                </a>
                <div className="db-card" style={styles.dbCard}>
                  <div className="survey-head" style={styles.surveyHead}>
                    <div className={statClass} style={statStyle}>
                      <div
                        className="stat-container"
                        style={styles.statContainer}
                      >
                        <h2
                          className="secondary-display"
                          style={styles.secondaryDisplay}
                        >
                          {survey.participantCount.toLocaleString()}
                        </h2>
                        <p className="info-text" style={styles.infoText}>
                          Participants completed this survey
                        </p>
                      </div>
                      {!searchWord && (
                        <div
                          className="stat-container"
                          style={styles.statContainer}
                        >
                          <h2
                            className="secondary-display"
                            style={styles.secondaryDisplay}
                          >
                            <span>{survey.questionCount} </span>
                          </h2>
                          <p className="info-text" style={styles.infoText}>
                            Questions Available
                          </p>
                        </div>
                      )}
                      {searchWord && !loading ? (
                        <div
                          className="stat-container"
                          style={styles.statContainer}
                        >
                          <h2
                            className="secondary-display"
                            style={styles.secondaryDisplay}
                          >
                            <span>{matchingQuestions.length}</span>
                          </h2>
                          <p className="info-text" style={styles.infoText}>
                            matching of{" "}
                            <span
                              className="highlight"
                              style={styles.highlight}
                            >
                              {survey.questionCount}
                            </span>{" "}
                            questions available
                          </p>
                        </div>
                      ) : null}
                    </div>
                    {surveyVersions.length > 0 ?
                      <div className="version-table"
                        style={styles.versionTable} >
                        <SurveyVersionTableReactComponent
                          surveyVersions={surveyVersions} />
                      </div>
                      : isCombinedPfhh ?
                        <div className="version-table" style={styles.versionTable}>
                          <PfhhSurveyTableReactComponent questionCount={pfhhQC} participantCount={pfhhPC} />
                        </div>
                        :
                        <div className="pdf-link" style={styles.pdfLink}>
                          Download Survey<br />
                          <a href={surveyPdfUrl} download>
                            <ClrIcon shape="file" className="is-solid" />  English
                          </a>
                          &#32;| &#32;
                          <a href={surveyPdfUrlSpanish} download>
                            <ClrIcon shape="file" className="is-solid" />  Spanish
                          </a>
                        </div>
                    }


                  </div>
                  {questions && (
                    <div
                      className="survey-results"
                      style={styles.surveyResults}
                    >
                      {questions.map((question, index) => {
                        const key = question.conceptId + "-" + index;
                        if (
                          question.type === "QUESTION" ||
                          question.type === "Question"
                        ) {
                          return (
                            <div className="question-result" key={key}>
                              <div
                                className="secondary-display"
                                style={styles.secondaryDisplay}
                              >
                                <div className="body-default">
                                  <SurveyQuestionReactComponent
                                    searchTerm={searchWord}
                                    surveyName={survey.name}
                                    surveyConceptId={survey.conceptId}
                                    isCopeSurvey={isCopeSurvey}
                                    question={question}
                                    participantCount={survey.participantCount}
                                    versionAnalysis={surveyVersions}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <h3 className="topic-text" key={key}>
                              {question.questionString}
                            </h3>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
          {!loading && searchWord && questions && questions.length === 0 ? (
            <div className="no-results" style={styles.noResults}>
              <p
                className="results-heading no-results"
                style={styles.noResults}
              >
                <span>
                  {" "}
                  No questions match any of the keywords:{" "}
                  <strong style={styles.strong}>{searchWord}</strong>.
                  <span className="search-extra">
                    {" "}
                    <button
                      className="btn btn-link"
                      onClick={() => this.handleChange("")}
                    >
                      Reset search
                    </button>
                  </span>
                </span>
              </p>
              <NoResultSearchComponent
                domainMatch={(val) => this.fetchSurvey(val)}
                searchValue={searchWord}
                measurementTestFilter={1}
                measurementOrderFilter={1}
              />
            </div>
          ) : null}
        </React.Fragment>
      );
    }
  }
);
