import * as React from "react";

import { Component, Input } from "@angular/core";
import { BaseReactWrapper } from "app/data-browser/base-react/base-react.wrapper";
import { AgeChartReactComponent } from "app/data-browser/charts/chart-age/chart-age-react.component";
import { BioSexChartReactComponent } from "app/data-browser/charts/chart-biosex/chart-biosex-react.component";
import { ValueReactChartComponent } from "app/data-browser/charts/chart-measurement-values/chart-value-react.component";
import { SourcesChartReactComponent } from "app/data-browser/charts/chart-sources/chart-sources-react.component";
import { HeatMapReactComponent } from "app/data-browser/components/heat-map/heat-map.component";
import { StackedColumnChartReactComponent } from "app/data-browser/charts/chart-stacked-age-gender/chart-stacked-age-gender-react.component";
import { SourceTreeComponent } from "app/data-browser/components/source-tree/source-tree-react.component";
import { TooltipNoIconReactComponent } from "app/data-browser/components/tooltip/tooltip-no-icon-react.component";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { ErrorMessageReactComponent } from "app/data-browser/views/error-message/error-message-react.component";
import { dataBrowserApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { GraphType } from "app/utils/enum-defs";
import { LoadingDots, Spinner } from "app/utils/spinner";
import { environment } from "environments/environment";

const styles = reactStyles({
  sourceLayout: {
    display: "flex",
    margin: "0 1em",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  sourcesChart: {
    width: "100%",
    marginLeft: "-1rem",
  },
  conceptBox: {
    background: "white",
  },
  conceptBoxInfo: {
    padding: ".5rem",
    textAlign: "left",
  },
  measurementFilterChoice: {
    color: "#262262",
  },
  ehrMChartLayout: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "1em",
  },
  ehrMChartItem: {
    width: "calc((33.3%) - 18px)",
    height: "auto",
    flexGrow: 1,
  },
  conceptBoxInfoP: {
    fontSize: "14px",
    color: "#262262",
    marginTop: "0",
    lineHeight: "1.5",
  },
  treeView: {
    height: "30em",
    overflowY: "scroll",
    fontSize: ".8em",
  },
  treeHeading: {
    borderBottom: "1px solid #262362",
    marginLeft: "1em",
    marginBottom: "1em",
    fontSize: ".8em",
  },
  exploreConceptLink: {
    fontSize: "14px",
    textAlign: "left",
    color: "#0079b8",
    cursor: "pointer",
  },
  noSources: {
    paddingBottom: "1em",
  },
  valuesChart: {
    fontSize: "0.8em",
  },
  unitPanel: {
    display: "flex",
    flexDirection: "row",
    gap: "1em 3em",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  noUnitPanel: {
    display: "flex",
    flexDirection: "row",
    gap: "1em",
    justifyContent: "center",
  },
});

const cssStyles = `
.unit-choice.active {
  border-style: solid;
  border-color: #bee1ff;
  border-radius: 2px 2px 2px 2px;
  margin: 1.5px 0;
  padding: 0 5px;
}

.measurement-filter-choice.active {
  text-decoration: underline;
}
.no-values{
    margin-top:1rem;
    margin-left: 50%;
    font-size: 18px;
    transform: translateX(-50%);
    width: fit-content;
    white-space: nowrap;
    color: #262262;
}
`;

interface State {
  graphButtons: any;
  graphToShow: string;
  selectedChartAnalysis: any;
  countAnalysis: any;
  isAnalysisLoaded: boolean;
  displayGraphErrorMessage: boolean;
  measurementGenderCountAnalysis: any;
  selectedMeasurementType: string;
  mixtureOfValues: boolean;
  noUnitValueButtons: any;
  conceptAnalyses: any;
  selectedTreeConcept: any;
  selectedUnit: string;
  sourceConcepts: any;
  selectedTreeNode: any;
  unitNames: any;
  toDisplayMeasurementGenderAnalysis: any;
  loading: boolean;
  toDisplayMeasurementGenderCountAnalysis: any;
  genderResults: any;
  node: any;
  sourcesLoading: boolean;
  showConceptCopyAlert: boolean;
}

interface Props {
  concept: any;
  domain: any;
  searchTerm: any;
  graphToShow: string;
}

export class ConceptChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      graphButtons:
        this.props.domain.name.toLowerCase() === "labs & measurements"
          ? ["Values", "Sex Assigned at Birth", "Age", "Sources", ...(environment.heatmap ? ["Map"] : []) ]
          : [
            "Sex Assigned at Birth",
            "Age",
            "Sources",
            ...(environment.heatmap ? ["Map"] : []),
            ...(environment.combinedAgeGenderChart ? ["Age + Sex"] : []),
          ],
      graphToShow: this.props.graphToShow
        ? this.props.graphToShow
        : this.props.domain === "labs & measurements"
        ? GraphType.Values
        : GraphType.BiologicalSex,
      displayGraphErrorMessage: false,
      selectedChartAnalysis: null,
      conceptAnalyses: null,
      countAnalysis: null,
      sourceConcepts: null,
      measurementGenderCountAnalysis: null,
      selectedUnit: null,
      unitNames: [],
      selectedMeasurementType: null,
      toDisplayMeasurementGenderAnalysis: undefined,
      toDisplayMeasurementGenderCountAnalysis: null,
      isAnalysisLoaded: false,
      mixtureOfValues: false,
      noUnitValueButtons: ["No Unit (Text)", "No Unit (Numeric)"],
      genderResults: undefined,
      loading: true,
      sourcesLoading: true,
      node: undefined,
      selectedTreeConcept: undefined,
      selectedTreeNode: undefined,
      showConceptCopyAlert: false,
    };
  }

  componentDidMount() {
    const {
      concept,
      domain: { name },
    } = this.props;
    dataBrowserApi()
      .getConceptAnalysisResults(
        [concept.conceptId.toString()],
        concept.domainId
      )
      .then((results) => {
        this.setState(
          {
            conceptAnalyses: results.items[0],
            displayGraphErrorMessage: false,
            selectedChartAnalysis:
              name.toLowerCase() === "labs & measurements"
                ? results.items[0].measurementValueGenderAnalysis
                : results.items[0].genderAnalysis,
            measurementGenderCountAnalysis:
              name.toLowerCase() === "labs & measurements"
                ? results.items[0].measurementGenderCountAnalysis
                : null,
            isAnalysisLoaded: true,
            loading: false,
          },
          () => {
            this.prepMeasurementChartData();
          }
        );
      })
      .catch((e) => {
        console.log(e, "error");
        this.setState({
          displayGraphErrorMessage: true,
          isAnalysisLoaded: true,
        });
      });
    dataBrowserApi()
      .getCountAnalysis(concept.domainId, "ehr")
      .then((results) => {
        this.setState({
          countAnalysis: results,
        });
      })
      .catch((e) => {
        console.log(e, "error");
      });
    dataBrowserApi()
      .getSourceConcepts(concept.conceptId)
      .then((results) => {
        const sources =
          results.items.length > 10
            ? results.items.slice(0, 10)
            : results.items;
        this.setState({
          sourceConcepts: sources,
        });
      })
      .catch((e) => {
        console.log(e, "error");
      });

    this.loadSourceTree(concept);
  }

  selectConceptCode(attrType: string) {
    const { concept, searchTerm } = this.props;
    const selectedConcept = this.state.selectedTreeNode
      ? this.state.selectedTreeNode
      : concept;
    const selectedText =
      attrType === "id"
        ? selectedConcept.conceptId
        : selectedConcept.conceptCode
        ? selectedConcept.conceptCode
        : selectedConcept.code;
    navigator.clipboard.writeText(selectedText);
    this.setState({
      showConceptCopyAlert: true,
    });
    setTimeout(() => {
      this.setState({ showConceptCopyAlert: false });
    }, 500);
  }

  selectGraphType(g) {
    const { conceptAnalyses } = this.state;
    let selectedAnalysis;
    let measurementGenderCountAnalysis;
    
    switch (g) {
      case GraphType.Age:
        selectedAnalysis = conceptAnalyses.ageAnalysis;
        break;
      case GraphType.Sources:
        selectedAnalysis = null;
        break;
      case GraphType.Values:
        selectedAnalysis = conceptAnalyses.measurementValueGenderAnalysis;
        measurementGenderCountAnalysis =
          conceptAnalyses.measurementGenderCountAnalysis;
        break;
      case GraphType.map:
        selectedAnalysis = conceptAnalyses.locationAnalysis;
        break;
      case GraphType.ageGenderStacked:
        selectedAnalysis = conceptAnalyses.combinedAgeGenderAnalysis;
        break;
      default:
        selectedAnalysis = conceptAnalyses.genderAnalysis;
        break;
    }

    this.setState(
      {
        graphToShow: g,
        selectedChartAnalysis: selectedAnalysis,
        measurementGenderCountAnalysis: measurementGenderCountAnalysis,
        displayGraphErrorMessage: selectedAnalysis === undefined,
      },
      () => {
        this.prepMeasurementChartData();
      }
    );
  }

  prepMeasurementChartData() {
    const { graphToShow, measurementGenderCountAnalysis, conceptAnalyses } =
      this.state;
    if (graphToShow === "Values") {
      const genderResults = conceptAnalyses.genderAnalysis.results;
      const chartGenderOrder = ["8507", "8532", "0"];
      genderResults.sort((a, b) => {
        return (
          chartGenderOrder.indexOf(a.stratum2) -
          chartGenderOrder.indexOf(b.stratum2)
        );
      });
      const unitCounts = [];
      if (measurementGenderCountAnalysis) {
        for (const aa of measurementGenderCountAnalysis) {
          let sumCount = 0;
          for (const ar of aa.results) {
            sumCount = sumCount + ar.countValue;
          }
          unitCounts.push({ name: aa.unitName, count: sumCount });
        }
      }
      unitCounts.sort((a, b) => {
        return b.count - a.count;
      });

      let unitNames = unitCounts.map((d) => d.name);
      const noUnit = unitNames.filter((n) => n.toLowerCase() === "no unit");
      unitNames = unitNames.filter((n) => n.toLowerCase() !== "no unit");
      if (noUnit.length > 0) {
        unitNames.push(noUnit[0]);
      }
      if (unitNames.length > 0) {
        this.setState(
          {
            selectedUnit: unitNames[0],
            unitNames: unitNames,
            genderResults: genderResults,
          },
          () => {
            this.showMeasurementGenderHistogram(unitNames[0]);
          }
        );
      }
    }
  }

  showMeasurementGenderHistogram(unit: string) {
    const { selectedChartAnalysis, measurementGenderCountAnalysis } =
      this.state;
    let mixtureOfValues = false;
    if (unit.toLowerCase() === "no unit") {
      const unitResults = selectedChartAnalysis.find(
        (aa) => aa.unitName === unit
      );
      if (
        unitResults &&
        unitResults.results &&
        unitResults.results.length > 0
      ) {
        const numericResults = unitResults.results.filter(
          (r) => r.measurementValueType === "numeric"
        );
        const textResults = unitResults.results.filter(
          (r) => r.measurementValueType === "text"
        );
        if (numericResults.length > 0 && textResults.length > 0) {
          mixtureOfValues = true;
        }
      }
    }
    const toDisplayMeasurementGenderAnalysis = {
      ...selectedChartAnalysis.find((aa) => aa.unitName === unit),
    };
    const toDisplayMeasurementGenderCountAnalysis =
      measurementGenderCountAnalysis
        ? measurementGenderCountAnalysis.find((aa) => aa.unitName === unit)
        : null;
    let selectedMeasurementType = null;
    if (mixtureOfValues) {
      toDisplayMeasurementGenderAnalysis.results =
        toDisplayMeasurementGenderAnalysis.results.filter(
          (r) => r.measurementValueType === "text"
        );
      selectedMeasurementType = "No Unit (Text)";
    }
    this.setState({
      selectedUnit: unit,
      mixtureOfValues: mixtureOfValues,
      selectedMeasurementType: selectedMeasurementType,
      toDisplayMeasurementGenderAnalysis: toDisplayMeasurementGenderAnalysis,
      toDisplayMeasurementGenderCountAnalysis:
        toDisplayMeasurementGenderCountAnalysis,
    });
  }

  fetchChartTitle(gender: any) {
    const { toDisplayMeasurementGenderCountAnalysis } = this.state;
    if (toDisplayMeasurementGenderCountAnalysis) {
      const genderResults =
        toDisplayMeasurementGenderCountAnalysis.results.filter(
          (r) => r.stratum3 === gender.stratum2
        )[0];
      return genderResults && genderResults.countValue > 20
        ? gender.analysisStratumName + " - " + genderResults.countValue
        : gender.analysisStratumName + " - &le; " + 20;
    } else {
      return gender.analysisStratumName + " - " + gender.countValue;
    }
  }

  showSpecificMeasurementTypeValues(su: any) {
    const { conceptAnalyses } = this.state;
    const tempDisplayMeasurementGenderAnalysis = {
      ...conceptAnalyses.measurementValueGenderAnalysis.find(
        (aa) => aa.unitName === "No unit"
      ),
    };
    if (su.toLowerCase().indexOf("text") >= 0) {
      tempDisplayMeasurementGenderAnalysis.results.filter(
        (r) => r.measurementValueType === "text"
      );
    } else {
      tempDisplayMeasurementGenderAnalysis.results.filter(
        (r) => r.measurementValueType === "numeric"
      );
    }
    const tempMeasurementCountAnalysis =
      conceptAnalyses.measurementGenderCountAnalysis.find(
        (aa) => aa.unitName === "No unit"
      );
    this.setState({
      selectedMeasurementType: su,
      toDisplayMeasurementGenderAnalysis: tempDisplayMeasurementGenderAnalysis,
      toDisplayMeasurementGenderCountAnalysis: tempMeasurementCountAnalysis,
    });
  }

  loadSourceTree(concept: any) {
    let treeData;
    dataBrowserApi()
      .getCriteriaRolledCounts(concept.conceptId, this.props.domain.domain)
      .then((result) => {
        treeData = result.parent;
        // treeLoading = false;
        this.setState({
          node: treeData,
          sourcesLoading: false,
        });
      })
      .catch((e) => {
        console.log(e, "error");
        this.setState({ sourcesLoading: false });
      });
  }

  childConceptClicked(selectedNode: any) {
    const id = parseInt(selectedNode.conceptId, 10);
    dataBrowserApi()
      .getSourceConcepts(id)
      .then((results) => {
        this.setState({
          selectedTreeNode: selectedNode,
          selectedTreeConcept: id,
          sourceConcepts:
            results.items.length > 10
              ? results.items.slice(0, 10)
              : results.items,
        });
      })
      .catch((e) => {
        console.log(e, "error");
      });
  }

  render() {
    const {
      searchTerm,
      concept,
      domain: { name },
    } = this.props;
    const {
      graphButtons,
      graphToShow,
      displayGraphErrorMessage,
      selectedChartAnalysis,
      countAnalysis,
      sourceConcepts,
      isAnalysisLoaded,
      unitNames,
      selectedUnit,
      mixtureOfValues,
      noUnitValueButtons,
      selectedMeasurementType,
      genderResults,
      toDisplayMeasurementGenderAnalysis,
      loading,
      node,
      selectedTreeConcept,
      selectedTreeNode,
      sourcesLoading,
      showConceptCopyAlert,
    } = this.state;
    
    
    const tabIndex = 0;
    return (
      <React.Fragment>
        <style>{cssStyles}</style>
        <div className="graph-menu">
          {(selectedChartAnalysis || sourceConcepts) &&
            graphButtons.map((g, index) => {
              return (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    this.selectGraphType(g);
                  }}
                  className={
                    graphToShow === g ? "active chart-choice" : "chart-choice"
                  }
                  tabIndex={tabIndex}
                  key={index}
                >
                  <span>{g}</span>
                  <TooltipReactComponent
                    tooltipKey={g}
                    label="EHR Tooltip Hover"
                    searchTerm={searchTerm}
                    action={
                      "Concept graph " +
                      g +
                      " tooltip hover on concept " +
                      concept.conceptName
                    }
                  ></TooltipReactComponent>
                </div>
              );
            })}
        </div>
        {loading && <Spinner />}
        {displayGraphErrorMessage ? (
          <div className="graph-error-message">
            <ErrorMessageReactComponent dataType="chart" />
          </div>
        ) : (
          <React.Fragment key={concept.conceptId}>
            {isAnalysisLoaded &&
            selectedChartAnalysis &&
            countAnalysis &&
            countAnalysis.genderCountAnalysis &&
            graphToShow === "Sex Assigned at Birth" ? (
              <div className="chart" key="biosex-chart">
                <BioSexChartReactComponent
                  domain="ehr"
                  genderAnalysis={selectedChartAnalysis}
                  genderCountAnalysis={countAnalysis.genderCountAnalysis}
                  selectedResult=""
                />
              </div>
            ) : graphToShow === "Map" ? (
              <div className="chart" key="map-chart">
                <HeatMapReactComponent
                  locationAnalysis={selectedChartAnalysis}/>
              </div>
            ) : graphToShow === "Age + Sex" ? (
              <div className="chart" key="age-gender-stacked-chart">
                <StackedColumnChartReactComponent ageGenderAnalysis={selectedChartAnalysis} />
              </div>
            ) : graphToShow === "Age" ? (
              <div className="chart" key="age-chart">
                <AgeChartReactComponent
                  domain="ehr"
                  ageAnalysis={selectedChartAnalysis}
                  ageCountAnalysis={countAnalysis.ageCountAnalysis}
                  selectedResult=""
                />
              </div>
            ) : (
              graphToShow === "Values" && (
                <div
                  className="chart"
                  key="values-chart"
                  style={styles.valuesChart}
                >
                  <div style={styles.unitPanel}>
                    {unitNames.map((unit, index) => {
                      return (
                        <div
                          key={index}
                          className={
                            selectedUnit === unit
                              ? "active btn btn-link unit-choice"
                              : "btn btn-link unit-choice"
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            this.showMeasurementGenderHistogram(unit);
                          }}
                        >
                          {unit}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.noUnitPanel}>
                    {mixtureOfValues &&
                      noUnitValueButtons.map((noUnit, index) => {
                        return (
                          <div
                            key={index}
                            className={
                              selectedMeasurementType === noUnit
                                ? "active btn btn-link measurement-filter-choice"
                                : "btn btn-link measurement-filter-choice"
                            }
                            style={styles.measurementFilterChoice}
                            onClick={(e) => {
                              e.stopPropagation();
                              this.showSpecificMeasurementTypeValues(noUnit);
                            }}
                          >
                            {noUnit}
                          </div>
                        );
                      })}
                  </div>
                  <div className="chart-container">
                    <div
                      className="ehr-m-chart-layout"
                      style={styles.ehrMChartLayout}
                    >
                      {genderResults && toDisplayMeasurementGenderAnalysis
                        ? genderResults.map((gender, index) => {
                            return (
                              <div
                                key={index}
                                className="ehr-m-chart-item"
                                style={styles.ehrMChartItem}
                              >
                                <ValueReactChartComponent
                                  conceptId={concept.conceptId}
                                  valueAnalysis={
                                    toDisplayMeasurementGenderAnalysis
                                  }
                                  genderId={gender.stratum2}
                                  chartTitle={this.fetchChartTitle(gender)}
                                />
                              </div>
                            );
                          })
                        : !loading && (
                            <p className="no-values">No Values Available</p>
                          )}
                    </div>
                  </div>
                </div>
              )
            )}
            {graphToShow === "Sources" && sourceConcepts && (
              <div className="source-layout" style={styles.sourceLayout}>
                <div
                  className="sources-chart"
                  style={styles.sourcesChart}
                  key="sources-chart"
                >
                  {showConceptCopyAlert && (
                    <div
                      style={{
                        margin: "-20px -20px 0 0",
                        position: "absolute",
                      }}
                    >
                      <div className="copy-alert">Link copied to clipboard</div>
                    </div>
                  )}
                  <div className="concept-box" style={styles.conceptBox}>
                    <div
                      className="concept-box-info"
                      style={styles.conceptBoxInfo}
                    >
                      <p style={styles.conceptBoxInfoP}>
                        <strong>
                          {selectedTreeNode
                            ? selectedTreeNode.name
                            : concept.conceptName}
                        </strong>
                      </p>
                      <div
                        style={styles.conceptBoxInfoP}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.selectConceptCode("code");
                        }}
                      >
                        <React.Fragment>
                          {selectedTreeNode
                            ? selectedTreeNode.type
                            : concept.vocabularyId}
                          Code:{" "}
                          {selectedTreeNode ? (
                            selectedTreeNode.code
                          ) : (
                            <TooltipNoIconReactComponent
                              tooltipKey="conceptCopyHelpText"
                              text={concept.conceptCode}
                            ></TooltipNoIconReactComponent>
                          )}
                        </React.Fragment>
                      </div>
                      <p
                        style={styles.conceptBoxInfoP}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.selectConceptCode("id");
                        }}
                      >
                        OMOP Concept Id:{" "}
                        {selectedTreeNode ? (
                          selectedTreeNode.conceptId
                        ) : (
                          <TooltipNoIconReactComponent
                            tooltipKey="conceptCopyHelpText"
                            text={concept.conceptId}
                          ></TooltipNoIconReactComponent>
                        )}
                      </p>
                      {selectedTreeNode && selectedTreeNode.canSelect === 1 && (
                        <a
                          href={
                            "/ehr/" +
                            selectedTreeNode.domainId.toLowerCase() +
                            "s/" +
                            selectedTreeNode.conceptId
                          }
                          style={styles.exploreConceptLink}
                        >
                          Explore this concept
                        </a>
                      )}
                    </div>
                    {sourceConcepts && sourceConcepts.length > 0 ? (
                      <SourcesChartReactComponent concepts={sourceConcepts} />
                    ) : (
                      <p className="no-values" style={styles.noSources}>
                        No Source Concepts
                      </p>
                    )}
                  </div>
                </div>
                {(name.toLowerCase() === "conditions" ||
                  name.toLowerCase() === "procedures") && (
                  <div style={{ width: "100%" }}>
                    <div style={styles.treeHeading}>
                      Count Breakdown ({concept.vocabularyId})
                    </div>
                    <div style={styles.treeView}>
                      {sourcesLoading && <LoadingDots />}
                      {node && (
                        <SourceTreeComponent
                          node={node}
                          selectedTreeConcept={selectedTreeConcept}
                          conceptedClicked={(e) => {
                            this.childConceptClicked(e);
                          }}
                          first={true}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

@Component({
  selector: "app-concept-chart-react",
  template: `<span #root></span>`,
})
export class ConceptChartWrapperComponent extends BaseReactWrapper {
  @Input() concept: any;
  @Input() domain: any;
  @Input() searchTerm: string;
  @Input() graphToShow: string;

  constructor() {
    super(ConceptChartReactComponent, [
      "concept",
      "domain",
      "searchTerm",
      "graphToShow",
    ]);
  }
}
