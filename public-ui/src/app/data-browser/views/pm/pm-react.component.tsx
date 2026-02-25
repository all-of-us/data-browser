import * as React from "react";

import { withRouteData } from "app/components/app-router";
import { AgeChartReactComponent } from "app/data-browser/charts/chart-age/chart-age-react.component";
import { ValueReactChartComponent } from "app/data-browser/charts/chart-measurement-values/chart-value-react.component";
import { GENDER_STRATUM_MAP } from "app/data-browser/charts/react-base-chart/base-chart.service";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { dataBrowserApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { PM_CONCEPTS } from "app/utils/constants";
import { navigateByUrl, urlParamsStore } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";
const isNumeric = (val: any): boolean =>
  !isNaN(parseFloat(val)) && isFinite(val);

const styles = reactStyles({
  pmContainer: {
    // No margin - matches genomic view
  },
  pageHeader: {
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingLeft: "18px",
    paddingRight: "18px",
    lineHeight: "1.5",
    fontSize: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "35px",
    margin: 0,
    fontFamily: "gothamBook",
  },
  homeButton: {
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "18px",
    color: "#262262",
    border: "1.5px solid #262262",
    borderRadius: "5px",
    background: "transparent",
    paddingTop: "0.1rem",
    paddingBottom: "0",
    paddingLeft: "0.4rem",
    paddingRight: "0.4rem",
    cursor: "pointer",
    textDecoration: "none",
  },
  aside: {
    paddingRight: "18px",
    display: "block",
  },
  dbCard: {
    width: "100%",
  },
  pmLayout: {
    display: "flex",
    paddingLeft: "18px",
    paddingRight: "18px",
  },
  btnLink: {
    fontSize: "14px",
    color: "#0077b7",
    textAlign: "left",
    textTransform: "capitalize",
    fontFamily: "GothamBook, Arial, sans-serif",
    padding: ".5rem",
    whiteSpace: "nowrap",
    cursor: "pointer",
    margin: 0,
  },
  btnList: {
    width: "14rem",
  },
  bsTitle: {
    paddingTop: "1em",
    paddingBottom: "18px",
  },
  chartLayout: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1em",
  },
});

const PMGroups = [
  {
    group: "blood-pressure",
    groupName: "Mean Blood Pressure",
    concepts: [
      {
        conceptId: "903118",
        conceptName: "Systolic",
        chartType: "histogram",
        analyses: [],
      },
      {
        conceptId: "903115",
        conceptName: "Diastolic",
        chartType: "histogram",
        analyses: [],
      },
    ],
  },
  {
    group: "height",
    groupName: "Height",
    concepts: [
      {
        conceptId: "903133",
        conceptName: "Height",
        chartType: "histogram",
        analyses: [],
      },
    ],
  },
  {
    group: "weight",
    groupName: "Weight",
    concepts: [
      {
        conceptId: "903121",
        conceptName: "Weight",
        chartType: "histogram",
        analyses: [],
      },
    ],
  },
  {
    group: "mean-waist",
    groupName: "Mean waist circumference",
    concepts: [
      {
        conceptId: "903135",
        conceptName: "Mean waist circumference",
        chartType: "histogram",
        analyses: [],
      },
    ],
  },
  {
    group: "mean-hip",
    groupName: "Mean hip circumference",
    concepts: [
      {
        conceptId: "903136",
        conceptName: "Mean hip circumference",
        chartType: "histogram",
        analyses: [],
      },
    ],
  },
  {
    group: "mean-heart-rate",
    groupName: "Mean heart rate",
    concepts: [
      {
        conceptId: "903126",
        conceptName: "Mean heart rate",
        chartType: "histogram",
        analyses: [],
      },
    ],
  },
  {
    group: "wheel-chair",
    groupName: "Wheelchair use",
    concepts: [
      {
        conceptId: "903111",
        conceptName: "Wheelchair use",
        chartType: "column",
        analyses: [],
      },
    ],
  },
  {
    group: "pregnancy",
    groupName: "Pregnancy",
    concepts: [
      {
        conceptId: "903120",
        conceptName: "Pregnancy",
        chartType: "column",
        analyses: [],
      },
    ],
  },
];

const styleCss = `
.active {
    font-weight: 900;
}
.button-item .btn-link {
    border-bottom: 1px solid;
  }

  div.button-item:nth-child(1) > button:nth-child(1) {
    border-top: 1px solid;
}

.bs-chart-item {
    width: calc((33.3%) - 18px);
    height: auto;
    flex-grow: 1;
}
.group-option {
    width: 100%;
    display: flex;
    justify-content: center;
}
.group-unit {
    display: flex;
    justify-content: center;
}
.unit-button {
    padding-right: 0.5em;
}
.unit-button.active, .concept-button.active {
    font-weight: 900;
    border-bottom: 4px solid #216fb4;
}
.active {
    font-weight: 3em;
    border: 2px solid #216fb4!important;
    background: white;
    }
div.button-item:not(:first-child) .active {
      border-top: 1px solid #216fb4!important;
      background: white;
}
.participant-count {
    width: 100%;
    text-align: center;
    padding-bottom: 18px
}
aside .button-item button {
    font-size: 0.8em;
}
@media (max-width: 550px) {
    .db-card {
        overflow-x: scroll;
    }
}
.chart-item {
    width: calc((50%) - 18px);
    height: auto;
    flex-grow: 1;
}
.age-chart {
    padding: 1em;
    padding-left: 1.5em;
    margin: 0;
}

.chart-item:last-of-type {
    width: 100%;
    max-width: calc((100%) - 18px);
    min-width: 20rem;
}

@media (max-width: 978px) {
    .pm-layout {
        flex-direction: column;
    }
    aside {
        flex-wrap: wrap;
        display: flex;
        justify-content: space-between;
        margin: -1em;
        margin-bottom: 0px
    }
    aside .button-item {
        padding: 18px;
        padding-top: 0;
    }
    .chart-item {
        width: 100%;
        height: auto;
    }
}
`;

interface State {
  pmGroups: any;
  loading: boolean;
  selectedGroup: any;
  selectedConcept: any;
  selectedConceptUnit: any;
  selectedConceptValueAnalysis: any;
  selectedConceptValueCountAnalysis: any;
  domainCountAnalysis: any;
  unitNames: Array<String>;
}

export const PMReactComponent = withRouteData(
  class extends React.Component<{}, State> {
    constructor(props) {
      super(props);
      this.state = {
        pmGroups: PMGroups,
        loading: true,
        selectedGroup: PMGroups[0],
        selectedConcept: PMGroups[0].concepts[0],
        selectedConceptUnit: null,
        domainCountAnalysis: null,
        selectedConceptValueAnalysis: null,
        selectedConceptValueCountAnalysis: null,
        unitNames: [],
      };
    }

    componentDidMount() {
      this.getPMData();
      this.getPMCountData();
    }

    getPMData() {
      const { pmGroups } = this.state;
      const { search } = urlParamsStore.getValue();
      dataBrowserApi()
        .getConceptAnalysisResults(PM_CONCEPTS)
        .then((result) => {
          const items = result.items;
          for (const group of pmGroups) {
            for (const concept of group.concepts) {
              concept.analyses = items.filter(
                (item) => item.conceptId === concept.conceptId
              )[0];
              if (concept.conceptId === "903133") {
                const sortOrder = ["centimeter", "inch (us)"];
                concept.analyses.measurementGenderCountAnalysis.sort((a, b) => {
                  return (
                    sortOrder.indexOf(a.unitName.toLowerCase()) -
                    sortOrder.indexOf(b.unitName.toLowerCase())
                  );
                });
              }
              this.arrangeConceptAnalyses(concept);
              this.setState({ loading: false });
            }
          }
          if (search) {
            let filteredConcept;

            if (isNumeric(search)) {
              const filteredGroup = pmGroups.filter((a) =>
                a.concepts.some((t) => t.conceptId.includes(search))
              );
              if (filteredGroup && filteredGroup.length > 0) {
                filteredConcept = filteredGroup[0];
              }
            } else {
              const filteredGroup = pmGroups.filter((conceptgroup) =>
                conceptgroup.groupName
                  .toLowerCase()
                  .includes(search.toLowerCase())
              );
              if (filteredGroup && filteredGroup.length > 0) {
                filteredConcept = filteredGroup[0];
              }
            }

            this.setState({ selectedGroup: filteredConcept });
          } else {
            this.setState({ selectedGroup: pmGroups[0] });
          }
          this.setUnit(pmGroups[0].concepts[0]);
        });
    }

    getPMCountData() {
      dataBrowserApi()
        .getCountAnalysis("Physical Measurements", "pm")
        .then((result) => {
          this.setState({ domainCountAnalysis: result });
        });
    }

    organizeGenders(concept: any) {
      const analysis = concept.analyses.genderAnalysis;
      let male = null;
      let female = null;
      let other = null;

      // No need to do anything if only one gender
      if (analysis.results.length <= 1) {
        return;
      }
      const results = [];
      for (const g of analysis.results) {
        if (g.stratum2 === "8507") {
          male = g;
        } else if (g.stratum2 === "8532") {
          female = g;
        } else if (g.stratum2 === "0") {
          other = g;
        }
      }

      // Order genders how we want to display  Male, Female , Others
      if (male) {
        results.push(male);
      }
      if (female) {
        results.push(female);
      }
      if (other) {
        results.push(other);
      }
      analysis.results = results;
    }

    setAnalysisStratum(results: any) {
      for (const r of results) {
        if (r.analysisStratumName === null || !r.analysisStratumName) {
          r.analysisStratumName = GENDER_STRATUM_MAP[r.stratum3];
        }
      }
    }

    arrangeConceptAnalyses(concept: any) {
      if (concept.analyses.genderAnalysis) {
        this.organizeGenders(concept);
      }

      let genders = ["8507", "8532", "0"];
      let prevResult;
      for (const gca of concept.analyses.measurementGenderCountAnalysis) {
        if (gca.results.length < 3) {
          for (const result of gca.results) {
            prevResult = result;
            genders = genders.filter((item) => item !== result.stratum3);
          }
          for (const gender of genders) {
            const missingResult = {
              ...prevResult,
              stratum3: gender,
              countValue: 20,
              sourceCountValue: 20,
            };
            gca.results.push(missingResult);
          }
        }
        this.setAnalysisStratum(gca.results);
      }
    }

    showMeasurement(pmConceptGroup: any, concept: any) {
      this.setUnit(concept);
      this.setState({
        selectedGroup: pmConceptGroup,
        selectedConcept: concept,
      });
    }

    setUnit(concept: any) {
      const unitNames = [];
      if (concept.analyses && concept.analyses.measurementGenderCountAnalysis) {
        for (const r of concept.analyses.measurementGenderCountAnalysis) {
          const tempUnitNames = r.results
            .map(({ stratum2 }) => stratum2)
            .filter((elem, index, self) => index === self.indexOf(elem));
          unitNames.push(...tempUnitNames);
        }
      }
      if (unitNames.length > 0) {
        this.setState(
          { selectedConceptUnit: unitNames[0], unitNames: unitNames },
          () => {
            this.setAnalysis();
          }
        );
      }
    }

    setConceptUnit(unit) {
      this.setState({ selectedConceptUnit: unit }, () => {
        this.setAnalysis();
      });
    }

    setAnalysis() {
      const { selectedConcept, selectedConceptUnit } = this.state;
      if (["903120", "903111"].indexOf(selectedConcept.conceptId) === -1) {
        this.setState({
          selectedConceptValueAnalysis:
            selectedConcept.analyses.measurementValueGenderAnalysis.filter(
              (a) =>
                a.unitName.toLowerCase() === selectedConceptUnit.toLowerCase()
            )[0],
          selectedConceptValueCountAnalysis:
            selectedConcept.analyses.measurementGenderCountAnalysis.filter(
              (a) =>
                a.unitName.toLowerCase() === selectedConceptUnit.toLowerCase()
            )[0],
        });
      }
    }

    getValueAnalysis() {
      const { selectedConceptValueAnalysis, selectedConcept } = this.state;
      return !selectedConceptValueAnalysis
        ? selectedConcept.analyses.measurementValueGenderAnalysis[0]
        : selectedConceptValueAnalysis;
    }

    getCountAnalysis() {
      const { selectedConcept, selectedConceptUnit } = this.state;
      const genderSort = ["Male", "Female", "Other"];
      return selectedConcept.analyses.measurementGenderCountAnalysis
        .filter((r) => r.unitName === selectedConceptUnit)[0]
        .results.sort((a, b) => {
          return (
            genderSort.indexOf(a.analysisStratumName) -
            genderSort.indexOf(b.analysisStratumName)
          );
        });
    }

    render() {
      const {
        loading,
        selectedGroup,
        selectedConcept,
        selectedConceptUnit,
        unitNames,
        domainCountAnalysis,
        pmGroups,
      } = this.state;
      return (
        <React.Fragment>
          <style>{styleCss}</style>
          <div style={styles.pmContainer}>
            <div style={styles.pageHeader}>
              <h1 style={styles.title}>Physical Measurements</h1>
              <a onClick={() => navigateByUrl("")} style={styles.homeButton}>
                Home
              </a>
            </div>
            {loading ? (
              <Spinner />
            ) : (
              <React.Fragment>
                {selectedGroup ? (
                  <div className="pm-layout" style={styles.pmLayout}>
                    <aside style={styles.aside}>
                      {pmGroups.map((pmConceptGroup, index) => {
                        const buttonClass =
                          selectedGroup === pmConceptGroup
                            ? "btn btn-link group-button active"
                            : "btn btn-link group-button";
                        return (
                          <div className="button-item" key={index}>
                            <button
                              className={buttonClass}
                              style={{ ...styles.btnLink, ...styles.btnList }}
                              onClick={() =>
                                this.showMeasurement(
                                  pmConceptGroup,
                                  pmConceptGroup.concepts[0]
                                )
                              }
                            >
                              {" "}
                              {pmConceptGroup.groupName}
                            </button>
                          </div>
                        );
                      })}
                    </aside>
                    <div className="db-card" style={styles.dbCard}>
                      <div className="db-card-inner">
                        <div className="db-card-header">
                          {selectedConcept &&
                          selectedConcept.analyses &&
                          selectedConcept.analyses
                            .measurementValueGenderAnalysis ? (
                            <div className="bs-title" style={styles.bsTitle}>
                              Sex
                              <TooltipReactComponent
                                tooltipKey="pmValueChartHelpText"
                                label="Physical Measurements tooltip hover"
                                searchTerm="TODO replace search text in here"
                                action={
                                  "Hover on pm biological sex chart of concept" +
                                  selectedConcept.conceptName
                                }
                              />
                            </div>
                          ) : null}
                          {selectedGroup &&
                          selectedGroup.concepts &&
                          selectedGroup.concepts.length > 1 ? (
                            <div className="group-option">
                              {selectedGroup.concepts.map((concept, index) => {
                                const btnClass =
                                  selectedConcept === concept
                                    ? "btn btn-link concept-button active"
                                    : "btn-link btn concept-button";
                                return (
                                  <button
                                    className={btnClass}
                                    key={index}
                                    onClick={() =>
                                      this.showMeasurement(
                                        selectedGroup,
                                        concept
                                      )
                                    }
                                    style={styles.btnLink}
                                  >
                                    {concept.conceptName}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                        {unitNames && unitNames.length > 1 ? (
                          <div className="group-unit">
                            {unitNames.map((unit, index) => {
                              const btnClass =
                                selectedConceptUnit === unit
                                  ? "btn btn-link unit-button active"
                                  : "btn btn-link unit-button";
                              return (
                                <button
                                  className={btnClass}
                                  key={index}
                                  onClick={() => this.setConceptUnit(unit)}
                                  style={styles.btnLink}
                                >
                                  {unit}
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                        {selectedConcept &&
                        (selectedConcept.conceptId === "903111" ||
                          selectedConcept.conceptId === "903120") ? (
                          selectedConcept.analyses.countAnalysis.results[0]
                            .countValue > 20 ? (
                            <div className="participant-count">
                              Total Participant count:{" "}
                              {
                                selectedConcept.analyses.countAnalysis
                                  .results[0].countValue
                              }
                            </div>
                          ) : (
                            <div className="participant-count">
                              Total Participant count: &le;{" "}
                              {
                                selectedConcept.analyses.countAnalysis
                                  .results[0].countValue
                              }
                            </div>
                          )
                        ) : null}
                        <div
                          className="chart-layout"
                          style={styles.chartLayout}
                        >
                          {selectedConcept &&
                          selectedConcept.analyses &&
                          selectedConcept.analyses
                            .measurementGenderCountAnalysis ? (
                            selectedConcept.conceptId !== "903111" &&
                            selectedConcept.conceptId !== "903120" &&
                            selectedConceptUnit ? (
                              <React.Fragment>
                                {this.getCountAnalysis().map(
                                  (gender, index) => {
                                    const chartKey =
                                      gender.stratum3 + "-" + index;
                                    return (
                                      <div
                                        className="bs-chart-item"
                                        key={chartKey}
                                      >
                                        <ValueReactChartComponent
                                          conceptId={selectedConcept.conceptId}
                                          valueAnalysis={this.getValueAnalysis()}
                                          genderId={gender.stratum3}
                                          chartTitle={
                                            gender.analysisStratumName +
                                            " - " +
                                            (gender.countValue <= 20
                                              ? "&le; "
                                              : "") +
                                            gender.countValue.toLocaleString()
                                          }
                                          key={chartKey}
                                        />
                                      </div>
                                    );
                                  }
                                )}
                              </React.Fragment>
                            ) : selectedConcept.analyses
                                .measurementValueGenderAnalysis ? (
                              <div className="chart-item stacked-chart-item">
                                <ValueReactChartComponent
                                  conceptId={selectedConcept.conceptId}
                                  valueAnalysis={
                                    selectedConcept.analyses
                                      .measurementValueGenderAnalysis[0]
                                  }
                                  genderId="stacked gender"
                                  chartTitle="stacked chart"
                                />
                              </div>
                            ) : null
                          ) : null}
                        </div>
                        {selectedConcept.analyses &&
                        selectedConcept.analyses.ageAnalysis ? (
                          <React.Fragment>
                            <div className="bs-title" style={styles.bsTitle}>
                              Age When Physical Measurement Was Taken
                              <TooltipReactComponent
                                tooltipKey="pmAgeChartHelpText"
                                label="Physical Measurements tooltip hover"
                                searchTerm="TODO replace search text in here"
                                action={
                                  "Hover on pm age chart of concept " +
                                  selectedConcept.conceptName
                                }
                              />
                            </div>
                            <div className="chart-item age-chart">
                              <AgeChartReactComponent
                                ageAnalysis={
                                  selectedConcept.analyses.ageAnalysis
                                }
                                ageCountAnalysis={
                                  domainCountAnalysis.ageCountAnalysis
                                }
                                domain="pm"
                                selectedResult=""
                              />
                            </div>
                          </React.Fragment>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>0 Results</div>
                )}
              </React.Fragment>
            )}
          </div>
        </React.Fragment>
      );
    }
  }
);
