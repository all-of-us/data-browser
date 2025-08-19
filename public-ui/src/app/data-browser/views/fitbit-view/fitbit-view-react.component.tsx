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
import { urlParamsStore } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";

const styles = reactStyles({
  fmLayout: {
    display: "grid",
    gridTemplateColumns: "20% 80%",
    columnGap: "0.5rem",
  },
  fmBody: {
    background: "white",
    borderRadius: "3px",
    padding: "2rem",
    paddingTop: "0",
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
  // fmMenuItem: {
  //   display: "flex",
  //   alignItems: "center",
  //   padding: "0.5rem",
  //   fontSize: "0.8em",
  //   /* border-bottom: 1px solid #262262 ; */
  //   // borderBottom: "1px solid #0079B8",
  //   borderTop: "1px solid #0079B8",
  //   cursor: "pointer",
  // },
  //  fmMenuItemActive: {
  //     display: "flex",
  //     alignItems: "center",
  //     padding: "0.5rem",
  //     fontSize: "0.8em",
  //     borderBottom: "1px solid #0079B8",
  //     borderTop: "2px solid #0079B8",
  //     borderLeft: "2px solid #0079B8",
  //     borderRight: "2px solid #0079B8",
  //     cursor: "pointer",
  //     // borderRadius: "3px",
  //     fontFamily: "GothamBold",
  //   },
  selectedDisplayH: {
    paddingBottom: "1rem",
    textTransform: "capitalize",
  },
  fmBodyTop: {
    display: "flex",
    justifyContent: "space-between",
  },
  fmBodyBottom: {
      paddingTop: "1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      gap: "1rem",
  },
  fmBottomChart: {
    background: "#216fb40d",
    padding: "1rem",
    borderRadius: "3px",
    minWidth: "15rem",
    paddingTop: "1rem",
    width: "100%",
  },
  fmMenuItemContainer: {
    // padding: "0.25rem 0rem",
    // borderBottom: "1px solid #262262",
    cursor: "pointer",
  },
  chartDisplayBody: {
    paddingBottom: "1rem",
  },
  fmChart: {
    background: "#216fb40d",
    width: "calc(50% - 0.5rem)",
    padding: "1rem",
    borderRadius: "3px",
    minWidth: "15rem",
  },
  displayName: {
    textTransform: "capitalize",
  },
});

const styleCss = `
div.fm-menu-item-container:nth-child(7) > div:nth-child(1){
  border-bottom:1px solid #0079B8;
}
  div.fm-menu-item-container {
  border-top:1px solid #0079B8;
  }
  .fb-menu-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    font-size: 0.8em;
    cursor: pointer,
  }
  .active {
  border: 2px solid #0079B8;
  border-top: 1px solid #0079B8;
  border-bottom: 1px solid #0079B8;
  font-family: GothamBold;
  background: white;
  }
  div.fm-menu-item-container:nth-child(7) > div.active{
  border-bottom: 2px solid #0079B8!important;
  }
@media (max-width: 900px) {
    .fm-body-top .fm-chart {
        width: 100%;
    }
    .fm-body-top .fm-chart:last-of-type {
        width: 100%;
        margin-top: 1rem;
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
          <div className="fm-container">
            <h1>Fitbit Data</h1>
            {loading && <Spinner />}
            {!loading && (
              <div className="fm-layout" style={styles.fmLayout}>
                <div className="fm-menu">
                  {concepts &&
                    concepts.map((concept, index) => {
                      const conceptClass =
                        selectedDisplay.toLowerCase() ===
                        concept.displayName.toLowerCase()
                          ? "fb-menu-item active"
                          : "fb-menu-item ";
                      return (
                        <div
                          className="fm-menu-item-container"
                          style={styles.fmMenuItemContainer}
                          key={index}
                        >
                          <div
                            tabIndex={tabIndex}
                            className={conceptClass}
                            onClick={() => this.setGraphs(concept)}
                          >
                            <div
                              className="fm-menu-item-display"
                              style={styles.fmMenuItemDisplay}
                            >
                              <span style={styles.displayName}>
                                {concept.displayName}
                              </span>
                              <TooltipReactComponent
                                tooltipKey={concept.tooltipKey}
                                label="Fitbit concept Hover"
                                searchTerm={search}
                                action="Fitbit concept hover"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="fm-body" style={styles.fmBody}>
                  <h2 style={styles.selectedDisplayH}>{selectedDisplay} </h2>

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
            )}
          </div>
        </React.Fragment>
      );
    }
  }
);
