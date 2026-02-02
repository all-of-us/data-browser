import * as React from "react";

import { environment } from "environments/environment";
import { withRouteData } from "app/components/app-router";
import { AgeChartReactComponent } from "app/data-browser/charts/chart-age/chart-age-react.component";
import { BioSexChartReactComponent } from "app/data-browser/charts/chart-biosex/chart-biosex-react.component";
import { ChartFitbitReactComponent } from "app/data-browser/charts/chart-fitbit/chart-fitbit-react.component";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { StackedColumnChartReactComponent } from "app/data-browser/charts/chart-stacked-age-gender/chart-stacked-age-gender-react.component";
import { HeatMapReactComponent } from "app/data-browser/components/heat-map/heat-map.component";
import { dataBrowserApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { fitbitConcepts } from "app/utils/constants";
import { navigateByUrl, urlParamsStore } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";

const styles = reactStyles({
  fmContainer: {
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
  fmLayout: {
    display: "flex",
    paddingLeft: "18px",
    paddingRight: "18px",
  },
  fmAside: {
    paddingRight: "18px",
    display: "block",
  },
  fmBody: {
    background: "white",
    borderRadius: "3px",
    padding: "2rem",
    paddingTop: "1.5em",
    width: "100%",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  fas: {
    paddingRight: "0.25em",
    fontSize: "2em",
  },
  fmMenuItemDisplay: {
    color: "#0079b8",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  selectedDisplayH: {
    paddingBottom: "1rem",
    textTransform: "capitalize",
  },
  fmBodyTop: {
    display: "flex",
    justifyContent: "space-between",
  },
  fmBodyBottom: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "1em",
    gap: "1rem",
  },
  fmBottomChart: {
    width: "100%",
    padding: "1em",
    background: "rgba(33, 111, 180, 0.05)",
  },
  fmMenuItemContainer: {
    cursor: "pointer",
  },
  chartDisplayBody: {
    paddingBottom: "1em",
    fontFamily: "GothamBook, Arial, sans-serif",
  },
  fmChart: {
    width: "calc((50%) - 18px)",
    height: "auto",
    flexGrow: 1,
  },
  btnLink: {
    fontSize: "14px",
    color: "#0077b7",
    textAlign: "left",
    textTransform: "capitalize",
    fontFamily: "GothamBook, Arial, sans-serif",
    padding: ".5rem",
    cursor: "pointer",
    margin: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  btnList: {
    width: "14rem",
  },
  displayName: {
    textTransform: "capitalize",
    flex: 1,
    paddingRight: "0.5rem",
  },
});

const styleCss = `
aside.fm-aside .button-item .btn-link {
  border-bottom: 1px solid #0077b7;
}

aside.fm-aside div.button-item:nth-child(1) > button:nth-child(1) {
  border-top: 1px solid #0077b7;
}

.active {
  font-weight: 900;
  border: 2px solid #216fb4!important;
  background: white;
}

aside.fm-aside div.button-item:not(:first-child) .active {
  border-top: 1px solid #216fb4!important;
  background: white;
}

aside.fm-aside .button-item button {
  font-size: 0.8em;
}

@media (max-width: 978px) {
  .fm-layout {
    flex-direction: column;
  }
  aside.fm-aside {
    flex-wrap: wrap;
    display: flex;
    justify-content: space-between;
    margin: -1em;
    margin-bottom: 0px;
  }
  aside.fm-aside .button-item {
    padding: 18px;
    padding-top: 0;
  }
}
`;

interface State {
  concepts: any;
  domainCountAnalysis: any;
  totalCountAnalysis: any;
  selectedItem: any;
  selectedDisplay: any;
  selectedAnalyses: any;
  loading: boolean;
}

export const FitbitReactComponent = withRouteData(
  class extends React.Component<{}, State> {
    constructor(props) {
      super(props);
      this.state = {
        concepts: fitbitConcepts,
        domainCountAnalysis: null,
        totalCountAnalysis: null,
        selectedItem: "any Fitbit data",
        selectedDisplay: "any Fitbit data",
        selectedAnalyses: null,
        loading: true,
      };
    }

    componentDidMount() {
      this.getFitbitData();
      this.getCountData();
    }

    getFitbitData() {
      const { concepts } = this.state;
      const { search } = urlParamsStore.getValue();
      const fitbitUpdateFlag = environment.fitbitCDRUpdate;
      const FITBIT_MEASUREMENTS = [
        "Any Fitbit Data",
        "Heart Rate (Summary)",
        "Heart rate (minute-level)",
        "Activity Daily Summary",
        "Activity intraday steps (minute-level)",
      ];
      if (fitbitUpdateFlag) {
        FITBIT_MEASUREMENTS.push("Sleep Daily Summary");
        FITBIT_MEASUREMENTS.push("Sleep Level (Sequence by level)");
      }
      dataBrowserApi()
        .getFitbitAnalysisResults(FITBIT_MEASUREMENTS)
        .then((result) => {
          let totalCountAnalysis = null;
          for (const item of result.items) {
            const fitbitConcept = concepts.filter((concept) =>
              concept.conceptName
                .toLowerCase()
                .includes(item.conceptId.toLowerCase())
            )[0];
            fitbitConcept.ageAnalysis = item.ageAnalysis;
            fitbitConcept.genderAnalysis = item.genderAnalysis;
            fitbitConcept.countAnalysis = item.countAnalysis;
            totalCountAnalysis = item.countAnalysis;
            fitbitConcept.participantCountAnalysis =
              item.participantCountAnalysis;
            fitbitConcept.combinedAgeGenderAnalysis = item.combinedAgeGenderAnalysis;
            fitbitConcept.locationAnalysis = item.locationAnalysis;
          }
          let selectedItem = this.state.selectedItem;
          let selectedDisplay = this.state.selectedDisplay;
          let selectedAnalyses = result.items[0];
          if (search) {
            const matchingConcepts = concepts.filter((concept) =>
              concept.conceptName.toLowerCase().includes(search.toLowerCase())
            );
            if (matchingConcepts && matchingConcepts.length > 0) {
              selectedItem = matchingConcepts[0].conceptName;
              selectedDisplay = matchingConcepts[0].displayName;
              selectedAnalyses = matchingConcepts[0];
            }
          }
          this.setState({
            concepts: concepts,
            totalCountAnalysis: totalCountAnalysis,
            selectedItem: selectedItem,
            selectedDisplay: selectedDisplay,
            selectedAnalyses: selectedAnalyses,
            loading: false,
          });
        });
    }

    getCountData() {
      dataBrowserApi()
        .getCountAnalysis("Fitbit", "fitbit")
        .then((result) => {
          this.setState({ domainCountAnalysis: result });
        });
    }

    setGraphs(concept) {
      this.setState({
        selectedAnalyses: concept,
        selectedItem: concept.displayName,
        selectedDisplay: concept.displayName,
      });
    }

    render() {
      const {
        concepts,
        selectedDisplay,
        selectedAnalyses,
        totalCountAnalysis,
        domainCountAnalysis,
        loading,
      } = this.state;
      const { search } = urlParamsStore.getValue();
      const tabIndex = 0;
      const selectedResult = null;
      return (
        <React.Fragment>
          <style>{styleCss}</style>
          <div className="fm-container" style={styles.fmContainer}>
            <div style={styles.pageHeader}>
              <h1 style={styles.title}>Fitbit Data</h1>
              <a onClick={() => navigateByUrl("")} style={styles.homeButton}>Home</a>
            </div>
            {loading && <Spinner />}
            {!loading && (
              <div className="fm-layout" style={styles.fmLayout}>
                <aside className="fm-aside" style={styles.fmAside}>
                  {concepts &&
                    concepts.map((concept, index) => {
                      const buttonClass =
                        selectedDisplay.toLowerCase() ===
                        concept.displayName.toLowerCase()
                          ? "btn btn-link group-button active"
                          : "btn btn-link group-button";
                      return (
                        <div className="button-item" key={index}>
                          <button
                            className={buttonClass}
                            style={{ ...styles.btnLink, ...styles.btnList }}
                            onClick={() => this.setGraphs(concept)}
                          >
                            <span style={styles.displayName}>
                              {concept.displayName}
                            </span>
                            <span onClick={(e) => e.stopPropagation()}>
                              <TooltipReactComponent
                                tooltipKey={concept.tooltipKey}
                                label="Fitbit concept Hover"
                                searchTerm={search}
                                action="Fitbit concept hover"
                              />
                            </span>
                          </button>
                        </div>
                      );
                    })}
                </aside>
                <div className="fm-body" style={styles.fmBody}>
                  <div className="db-card-inner">
                    <div className="fm-body-bottom" style={styles.fmBodyBottom}>
                      <div className="fm-chart" style={styles.fmBottomChart}>
                        <div className="display-body" style={styles.chartDisplayBody}>
                          Age + Sex
                        </div>
                        {selectedAnalyses && selectedAnalyses.combinedAgeGenderAnalysis && (
                          <StackedColumnChartReactComponent
                            ageGenderAnalysis={selectedAnalyses.combinedAgeGenderAnalysis}
                            selectedResult={selectedResult}
                            domain="fitbit"
                          />
                        )}
                      </div>
                      <div className="fm-chart" style={styles.fmBottomChart}>
                        <div className="display-body" style={styles.chartDisplayBody}>
                          Location
                        </div>
                        {selectedAnalyses && selectedAnalyses.locationAnalysis && (
                          <HeatMapReactComponent
                            locationAnalysis={selectedAnalyses?.locationAnalysis}
                            domain="fitbit"
                            selectedResult={selectedResult}
                            color = "" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </React.Fragment>
      );
    }
  }
);