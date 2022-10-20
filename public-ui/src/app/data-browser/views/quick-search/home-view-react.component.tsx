import * as React from "react";
import _ from "lodash";

import { environment } from "environments/environment";
import { withRouteData } from "app/components/app-router";
import { CdrVersionReactComponent } from "app/data-browser/cdr-version/cdr-version-info";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import {
  dataBrowserApi,
  genomicsApi,
} from "app/services/swagger-fetch-clients";
import { PopUpReactComponent } from "app/shared/components/pop-up/PopUpReactComponent";
import { reactStyles } from "app/utils";
import { genomicTileMetadata } from "app/utils/constants";
import { globalStyles } from "app/utils/global-styles";
import { triggerEvent } from "app/utils/google_analytics";
import { NavStore } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";

const css = `
.disclaimer-btn {
    font-size: 15px;
    color: #337ab7;
    cursor: pointer;
    background: none!important;
    border: none;
    padding: 0!important;
    text-decoration: underline;
}
.disclaimer-btn:hover {
    color: #262262;
}
  .icons img {
    width: 100px;
}
.icons:first-of-type {
    margin-left: 0;
}
.icons {
    width: 100px;
    margin-left: 1.5rem;
    text-align: center;
}
.icons img {
    text-align: center;
}
.icon-link{
    color:#2b266d;
}
.result-bottom-link {
    white-space: pre;
    font-size: 15px;
    color: #337ab7;
    cursor: pointer;
}
.result-bottom-link:hover {
    color: #262262;
}

.survey-result-boxes {
  display: grid;
  grid-template-columns: repeat(4, minmax(239px, 1fr));
  column-gap:1rem;
  row-gap:1rem;
}
.result-boxes {
  display: grid;
  grid-template-columns: repeat(4, minmax(239px, 1fr));
  grid-template-areas: 
  '. . . .'
  'gHeading pmHeading pmHeading pmHeading'
  ' gBoxes pmBoxes pmBoxes pmBoxes';
  
  grid-template-rows: 1fr;
  column-gap: 1rem;
  row-gap:1rem;
  margin-bottom: 2rem;
}

.genomic-boxes {
  display: grid;
  grid-template-columns: 1fr;
  grid-area: gBoxes;
  column-gap: 1rem;
}

.pm-boxes{
  grid-area: pmBoxes;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  column-gap:1rem;


}
.pm-boxes .result-box{
    // margin-right:1rem;
}
.result-box {
    cursor: pointer;
    min-width:239px;
    // display: flex;
    // flex-direction: column;
    display:grid;
    grid-template-rows: 20% 55% 1fr;
    border-radius: 5px;
    background-color: #ffffff;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
.genomic-result-box {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    margin-bottom: 18px;
    border-radius: 5px;
    background-color: #ffffff;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
.search-icon-container {
    display: flex;
    flex-wrap: wrap;
    flex-flow: column-reverse;
    padding-left:1em;
    justify-content: 'flex-start';
}
.pm-boxes {
  display:grid;
  grid-template-columns: repeat(3, minmax(239px, 1fr));
  column-gap:1rem;
}
.result-box:last-of-type {
  margin-right: 0;
}

@media (max-width: 1048px) {

  .result-boxes {
    grid-template-columns: repeat(3, minmax(239px, 1fr));
    grid-template-areas:
    ' .       .'
    ' .       .'
    'gHeading pmHeading'
    'gBoxes pmBoxes ';
}
.survey-result-boxes{
  grid-template-columns: repeat(3, minmax(239px, 1fr));
}
  .genomic-boxes {
    grid-template-columns: repeat(1, minmax(239px, 1fr));
  }
  .pm-boxes {
    width: calc((100vw)/1.57);
    grid-template-columns: repeat(2, minmax(239px, 1fr));
  }

  .cope-preview {
      justify-content: flex-start;
  }
  .tooltip-container {
      padding-left: 1em;
  }
}
@media (max-width: 766px) {
  .result-boxes {
    grid-template-areas:
    ' . .'
    ' . .'
    'gHeading gHeading'
    ' gBoxes gBoxes'
    'pmHeading pmHeading'
    'pmBoxes pmBoxes ';

}
  .result-boxes, .survey-result-boxes{
    grid-template-columns: repeat(2, minmax(239px, 1fr));
  }
  .pm-boxes {
    width:auto;
    grid-template-columns: repeat(2, minmax(239px, 1fr));
  }
  .genomic-boxes{
    grid-template-columns: repeat(2, minmax(239px, 1fr));
  }
}
    `;
const styles = reactStyles({
  searchIconLayout: {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    padding: "1em",
  },
  toolTipContainer: {
    paddingLeft: "1em",
  },
  results: {
    padding: "18px",
  },
  resultBoxes: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: "2rem",
    flexGrow: 1,
  },
  resultBox: {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    // width: "calc(((100% / 12) * 3) - 18px)",
    marginRight: "18px",
    marginBottom: "18px",
    borderRadius: "5px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.15)",
  },
  resultBoxTitle: {
    color: "#337ab7",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    padding: "18px",
    paddingBottom: "3px",
    margin: "0",
    fontSize: "16px",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultBody: {
    color: "#302c71",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "14px",
    padding: "18px",
    paddingTop: "0px",
    display: "flex",
    flexDirection: "column",
  },
  genDesc: {
    marginBottom: "1em",
  },
  genomicTile: {
    display: "flex",
    flexDirection: "row",
  },
  participantText: {
    display: "block",
  },
  resultBoxLink: {
    padding: "18px",
    paddingTop: "36px",
  },
  resultHeading: {
    fontSize: "23px",
    margin: "0",
    paddingTop: "9px",
    // paddingBottom: "9px",
    paddingLeft: "0",
  },
  resultBodyItem: {
    padding: "6px 0",
  },
  resultStat: {
    color: "#302c71",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "35px",
    lineHeight: "1em",
  },
  dBTitle: {
    textAlign: "center",
    margin: 0,
    padding: "18px",
  },
  dBDesc: {
    padding: "18px",
    paddingBottom: "63px",
    margin: "0 auto",
    lineHeight: "2",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "20px",
  },
  dbSubDesc: {
    padding: "2rem",
    textAlign: "center",
  },
  iconLinks: {
    position: "relative",
    top: "-1rem",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    width: "100%",
    color: "#2b266d",
  },
  resultBodyDescription: {
  },
});

interface ResultLinkProps {
  name: string;
  description: string;
  description2: string;
  questionCount: number;
  standardConceptCount: number;
  domain: string;
  participantCount: number;
  searchWord: string;
  domainType: string;
  wgsParticipantCount: number;
  microarrayParticipantCount: number;
  variantListSize: number;
  loadingVariantListSize: boolean;
  typing: boolean;
}

export const ResultLinksComponent = class extends React.Component<ResultLinkProps> {
  constructor(props: ResultLinkProps) {
    super(props);
  }

  resultClick(info) {
    if (info.domainConceptId) {
      let url;
      switch (info.domainConceptId) {
        // condition
        case 19:
          url = this.props.searchWord
            ? "ehr/conditions/" + this.props.searchWord
            : "ehr/conditions";
          NavStore.navigateByUrl(url);
          break;
        // drugs
        case 13:
          url = this.props.searchWord
            ? "ehr/drug-exposures/" + this.props.searchWord
            : "ehr/drug-exposures";
          NavStore.navigateByUrl(url);
          break;
        // MEASUREMENT
        case 21:
          url = this.props.searchWord
            ? "ehr/labs-and-measurements/" + this.props.searchWord
            : "ehr/labs-and-measurements";
          NavStore.navigateByUrl(url);
          break;
        // PROCEDURE
        case 10:
          url = this.props.searchWord
            ? "ehr/procedures/" + this.props.searchWord
            : "ehr/procedures";
          NavStore.navigateByUrl(url);
          break;
      }
    } else if (info.conceptId) {
      let url;
      switch (info.conceptId) {
        case 1333342:
          url = this.props.searchWord
            ? "survey/covid-19-participant-experience/" + this.props.searchWord
            : "survey/covid-19-participant-experience";
          NavStore.navigateByUrl(url);
          break;
        case 43528895:
          url = this.props.searchWord
            ? "survey/health-care-access-and-utilization/" +
            this.props.searchWord
            : "survey/health-care-access-and-utilization";
          NavStore.navigateByUrl(url);
          break;
        default:
          url = this.props.searchWord
            ? "survey/" +
            info.name.replaceAll(" ", "-").toLowerCase() +
            "/" +
            this.props.searchWord
            : "survey/" + info.name.replaceAll(" ", "-").toLowerCase();
          NavStore.navigateByUrl(url);
          break;
      }
    } else {
      if (info.name === "Physical Measurements") {
        const url = this.props.searchWord
          ? "physical-measurements/" + this.props.searchWord
          : "physical-measurements";
        NavStore.navigateByUrl(url);
      } else if (info.name === "Fitbit") {
        const url = this.props.searchWord
          ? "fitbit/" + this.props.searchWord
          : "fitbit";
        NavStore.navigateByUrl(url);
      } else if (info.name === "Genomic Variants") {
        const url = this.props.searchWord
          ? "genomic-variants/" + this.props.searchWord
          : "genomic-variants";
        NavStore.navigateByUrl(url);
      }
    }
  }
  render() {
    const {
      name,
      description,
      questionCount,
      standardConceptCount,
      domain,
      participantCount,
      domainType,
      searchWord,
      wgsParticipantCount,
      microarrayParticipantCount,
      variantListSize,
      loadingVariantListSize,
      typing
    } = this.props;
    return (
      <div onClick={() => this.resultClick(this.props)} className="result-box">
        <div style={styles.resultBoxTitle}>
          <div>{name}</div>
          <div>
            <TooltipReactComponent
              label="Homepage Tooltip Hover"
              action={"Hover on " + name + "tile tooltip"}
              tooltipKey={domain ? domain.toLowerCase() : name.toLowerCase()}
              searchTerm=""
            />
          </div>
        </div>
        <div style={styles.resultBody}>
          {(domainType === "ehr" || domainType === "pmw") && (
            <span style={styles.resultBodyItem}>
              <div style={styles.resultStat}>
                {standardConceptCount.toLocaleString()}
              </div>
            </span>
          )}
          {domainType === "survey" && (
            <span style={styles.resultBodyItem}>
              <div style={styles.resultStat}>
                {questionCount.toLocaleString()}
              </div>
            </span>
          )}
          {domainType === "genomics" && !searchWord && (
            <span style={styles.resultBodyItem}>
              <React.Fragment>
                <div style={styles.resultStat}>
                  {wgsParticipantCount.toLocaleString()}
                </div>
                <span>
                  {" "}
                  participants in the Whole Genome Sequencing (WGS) dataset
                </span>
              </React.Fragment>
            </span>
          )}
          {searchWord && domainType === "ehr" && (
            <span style={styles.resultBodyItem}>
              <span>matching medical concepts</span>
            </span>
          )}
          {searchWord && domainType === "survey" && (
            <span style={styles.resultBodyItem}>
              <span>matching survey questions</span>
            </span>
          )}
          {searchWord && name.toLowerCase() === "physical measurements" && (
            <span style={styles.resultBodyItem}>
              <span>matching Physical Measurements</span>
            </span>
          )}
          {searchWord && name.toLowerCase() === "fitbit" && (
            <span style={styles.resultBodyItem}>
              <span>matching Fitbit Measurements</span>
            </span>
          )}
          {!searchWord && domainType === "ehr" && (
            <span style={styles.resultBodyItem}>
              <span>medical concepts</span>
            </span>
          )}
          {!searchWord && domainType === "survey" && (
            <span style={styles.resultBodyItem}>
              <span>questions available</span>
            </span>
          )}
          {!searchWord && name.toLowerCase() === "physical measurements" && (
            <span style={styles.resultBodyItem}>
              <span>Physical Measurements</span>
            </span>
          )}
          {!searchWord && name.toLowerCase() === "fitbit" && (
            <span style={styles.resultBodyItem}>
              <span>Fitbit Measurements</span>
            </span>
          )}
          {participantCount && !(domainType === "genomics") && (
            <span style={styles.resultBodyItem}>
              <span>
                <strong> {participantCount.toLocaleString()}</strong>{" "}
                participants in this domain
              </span>
            </span>
          )}

          {domainType === "genomics" && !searchWord && (
            <React.Fragment>
              <div style={styles.resultStat}>
                {microarrayParticipantCount.toLocaleString()}{" "}
              </div>{" "}
              <span>participants in the Genotyping Array dataset</span>
            </React.Fragment>
          )}
          {domainType === "genomics" &&
            searchWord &&
            !loadingVariantListSize &&
            variantListSize > 0 && (
              <React.Fragment>
                <span style={styles.resultBodyItem}>
                {(typing || loadingVariantListSize) && <Spinner />}
                {(!typing && !loadingVariantListSize) &&
                <React.Fragment>
                  <div style={styles.resultStat}>{variantListSize.toLocaleString()}</div>{" "}
                </React.Fragment>}
                matching genomic variants
                </span>
                <span style={styles.resultBodyItem}>
                  <div style={styles.resultStat}>
                    {microarrayParticipantCount.toLocaleString()}{" "}
                  </div>
                  participants in this domain
                </span>
              </React.Fragment>
            )}
          {questionCount && (
            <div style={styles.resultBodyItem}>
              <span>{description}</span>
            </div>
          )}
          {name.toLowerCase() === "physical measurements" && (
            <span style={styles.resultBodyDescription}>
              Participants have the option to provide a standard set of physical
              measurements.
            </span>
          )}
          {name.toLowerCase() === "fitbit" && (
            <span style={styles.resultBodyDescription}>
              Fitbit data includes heart rate and activity summaries.
            </span>
          )}
        </div>
        <div style={styles.resultBoxLink}>
          {questionCount ? (
            <a className="result-bottom-link">View Complete Survey</a>
          ) : domain === "Genomics" ? (
            <a className="result-bottom-link">View Genomic Variants</a>
          ) : (
            <a className="result-bottom-link">View {name}</a>
          )}
        </div>
      </div>
    );
  }
};

interface State {
  surveyInfo: any[];
  domainInfo: any[];
  genomicInfo: any;
  variantListSize: number;
  loadingVariantListSize: boolean;
  physicalMeasurementsInfo: any[];
  searchWord: string;
  popUp: boolean;
  loading: boolean;
}

export const dBHomeComponent = withRouteData(
  class extends React.Component<{}, State> {
    typing = false;
    constructor(props: State) {
      super(props);
      this.state = {
        surveyInfo: [],
        domainInfo: [],
        genomicInfo: null,
        variantListSize: null,
        loadingVariantListSize: false,
        physicalMeasurementsInfo: [],
        searchWord: localStorage.getItem("searchText")
          ? localStorage.getItem("searchText")
          : "",
        popUp: false,
        loading: true,
      };
    }

    search = _.debounce((val) => {
      this.typing = true;
      this.getDomainInfos();
      this.getVariantResultSize();
    }, 1000);

    handleChange(val) {
      this.setState({ searchWord: val });
      this.search(val);
      this.typing = false;
    }
    iconClickEvent(iconString: string) {
      if (iconString === "introductory-videos") {
        NavStore.navigateByUrl("/" + iconString);
      }
    }

    // life cycle hook
    componentDidMount() {
      this.getDomainInfos();
      this.getVariantResultSize();
      this.getGenomicParticipantCounts();
    }

    getGenomicParticipantCounts() {
      return genomicsApi()
        .getParticipantCounts()
        .then((result) => {
          if (result.results) {
            genomicTileMetadata.wgsParticipantCount = result.results.filter(
              (r) => r.stratum4 === "wgs"
            )[0].countValue;
            genomicTileMetadata.microarrayParticipantCount =
              result.results.filter(
                (r) => r.stratum4 === "micro-array"
              )[0].countValue;
          }
          this.setState({ genomicInfo: genomicTileMetadata });
        })
        .catch((e) => {
          console.log(e, "error");
        });
    }

    getVariantResultSize() {
      const { searchWord } = this.state;
      this.setState({loadingVariantListSize: true});
      const variantSizeRequest = {
        query: searchWord,
        filterMetadata: null,
      };
      genomicsApi()
        .getVariantSearchResultSize(variantSizeRequest)
        .then((result) => {
          this.setState({
            variantListSize: result,
            loadingVariantListSize: false
          });
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loadingVariantListSize: false });
        });
    }

    getDomainInfos() {
      // http get the domain info to populate the cards on the homepage
      const { searchWord } = this.state;
      if (searchWord) {
        triggerEvent(
          "searchOnLandingPage",
          "Search",
          "Homepage Search Across Data",
          "Homepage Search",
          this.state.searchWord,
          null
        );
      }
      return dataBrowserApi()
        .getDomainTotals(this.state.searchWord, 1, 1)
        .then((result) => {
          result.domainInfos = result.domainInfos.filter(
            (domain) => domain.standardConceptCount > 0
          );
          result.surveyModules = result.surveyModules.filter(
            (survey) => survey.questionCount > 0
          );
          const domainInfo = result.domainInfos.filter(
            (domain) =>
              domain.name.toLowerCase() !== "physical measurements" &&
              domain.name.toLowerCase() !== "fitbit"
          );
          const physicalMeasurementsInfo = result.domainInfos.filter(
            (domain) => {
              return (
                domain.name.toLowerCase() === "physical measurements" ||
                domain.name.toLowerCase() === "fitbit"
              );
            }
          );
          this.setState({
            domainInfo: domainInfo,
            surveyInfo: result.surveyModules,
            physicalMeasurementsInfo: physicalMeasurementsInfo,
            loading: false,
          });
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loading: false });
        });
    }
    closePopUp() {
      this.setState({
        popUp: !this.state.popUp,
      });
    }

    render() {
      const {
        domainInfo,
        physicalMeasurementsInfo,
        surveyInfo,
        searchWord,
        popUp,
        loading,
        genomicInfo,
        variantListSize,
        loadingVariantListSize,
      } = this.state;
      const noResults =
        domainInfo.length === 0 &&
        physicalMeasurementsInfo.length === 0 &&
        surveyInfo.length === 0 &&
        variantListSize === 0;
      return (
        <React.Fragment>
          <style>{css}</style>
          <h1 style={{ ...globalStyles.primaryDisplay, ...styles.dBTitle }}>
            Data Browser
          </h1>
          <p style={{ ...styles.dBDesc, ...globalStyles.bodyLead }}>
            The Data Browser provides interactive views of the
            publicly-available <i>All of Us</i>&#32; Research Program
            participant data. Electronic Health Record (EHR) data are derived
            from reports by health care providers. Genomic data are derived from
            biosamples provided by participants. Physical measurements are taken
            at the time of participant enrollment. Data from survey responses
            and wearables data are collected from participants on an ongoing
            basis.
            <br />
            <br />
            In order to protect participant privacy, we have removed personal
            identifiers, rounded aggregate data to counts of 20, and only
            included summary demographic information. Detailed data are
            available for analysis in the Researcher Workbench.
            <br />
            <br />
            <button
              onClick={() => this.closePopUp()}
              className="disclaimer-btn"
            >
              public data use statement
            </button>
          </p>
          <div className="search-icon-container">
            <div>
              <SearchComponent
                value={searchWord}
                searchTitle="Search Across Data Types"
                domain="home"
                onChange={(val) => this.handleChange(val)}
                onClear={() => this.handleChange("")}
                placeholderText="Keyword Search"
              />
              <CdrVersionReactComponent />
            </div>
            <div style={styles.iconLinks}>
              <div className="icons" onClick={() => this.iconClickEvent("FAQ")}>
                <a
                  href={
                    environment.researchAllOfUsUrl +
                    "/frequently-asked-questions/#data-browser-faqs"
                  }
                >
                  <img alt="FAQs" src="/assets/icons/icons_faqs.png" />
                  <span className="icon-link">FAQs</span>
                </a>
              </div>
              <div
                className="icons"
                onClick={() => this.iconClickEvent("introductory-videos")}
              >
                <a>
                  <img
                    alt="Introductory Videos"
                    src="/assets/icons/icons_introductoryvideo.png"
                  />
                  <span className="icon-link">Introductory Videos</span>
                </a>
              </div>
              <div
                className="icons"
                onClick={() => this.iconClickEvent("User-Guide")}
              >
                <a
                  href="/assets/pdf/Databrowser_User_Guide_in_RH 5_18_20.pdf"
                  target="_blank"
                >
                  <img
                    alt="User Guide"
                    src="/assets/icons/icons_userguide.png"
                  />
                  <span className="icon-link">User Guide</span>
                </a>
              </div>
            </div>
          </div>
          {(loading || loadingVariantListSize) && <Spinner />}
          {!loading && !loadingVariantListSize && (
            <section style={styles.results}>
              <h5
                style={{
                  ...globalStyles.secondaryDisplay,
                  ...styles.resultHeading,
                }}
              >
                EHR Domains
              </h5>
              <div className="result-boxes">
                {domainInfo.length > 0 && (
                  <React.Fragment>
                    {domainInfo.map((domain, index) => {
                      const key = "domain" + index;
                      return (
                        <ResultLinksComponent
                          typing={!this.typing}
                          key={key}
                          searchWord={searchWord}
                          {...domain}
                          domainType="ehr"
                          variantListSize={variantListSize}
                          loadingVariantListSize={loadingVariantListSize}
                        />
                      );
                    })}
                  </React.Fragment>
                )}
                {environment.geno &&
                  genomicInfo &&
                  !loadingVariantListSize &&
                  variantListSize > 0 && (<React.Fragment>
                    <h5
                      style={{
                        ...globalStyles.secondaryDisplay,
                        ...styles.resultHeading,
                        gridArea: 'gHeading',
                        marginBottom: '-1rem',
                      }}
                    >
                      Genomics
                    </h5>
                    <div className="genomic-boxes">


                      <ResultLinksComponent
                        typing={!this.typing}
                        key="genomics-tile"
                        searchWord={searchWord}
                        {...genomicInfo}
                        domainType="genomics"
                        variantListSize={variantListSize}
                        loadingVariantListSize={loadingVariantListSize}
                      />
                    </div>
                  </React.Fragment>
                  )}
                {physicalMeasurementsInfo.length > 0 && (<React.Fragment>
                  <h5
                    style={{
                      ...globalStyles.secondaryDisplay,
                      ...styles.resultHeading,
                      gridArea: 'pmHeading',
                      marginBottom: '-1rem',
                      whiteSpace:'nowrap'
                    }}
                  >
                    Physical Measurements and Wearables
                  </h5>
                  <div className="pm-boxes">
                    {physicalMeasurementsInfo.map(
                      (phyMeasurements, index) => {
                        const key = "phyMeasurements" + index;
                        return (
                          <ResultLinksComponent
                            typing={!this.typing}
                            key={key}
                            searchWord={searchWord}
                            {...phyMeasurements}
                            domainType="pmw"
                            variantListSize={variantListSize}
                            loadingVariantListSize={loadingVariantListSize}
                          />
                        );
                      }
                    )}
                  </div>
                </React.Fragment>
                )}
              </div>
              {surveyInfo.length > 0 && (
                <React.Fragment>
                  <h5
                    style={{
                      ...globalStyles.secondaryDisplay,
                      ...styles.resultHeading,
                    }}
                  >
                    Survey Questions
                  </h5>
                  <div className="survey-result-boxes">
                    {surveyInfo.map((survey, index) => {
                      const key = "survey" + index;
                      return (
                        <ResultLinksComponent
                          typing={!this.typing}
                          key={key}
                          searchWord={searchWord}
                          {...survey}
                          domainType="survey"
                          variantListSize={variantListSize}
                          loadingVariantListSize={loadingVariantListSize}
                        />
                      );
                    })}
                  </div>
                </React.Fragment>
              )}
              {noResults && (
                <h5
                  style={{
                    ...globalStyles.secondaryDisplay,
                    ...styles.resultHeading,
                  }}
                >
                  0 results
                </h5>
              )}
            </section>
          )}
          {popUp && (
            <PopUpReactComponent
              helpText="HomeViewPopup"
              onClose={() => this.closePopUp()}
            />
          )}
        </React.Fragment>
      );
    }
  }
);
