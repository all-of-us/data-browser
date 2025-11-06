import * as React from "react";
import _ from "lodash";

import { environment } from "environments/environment";
import { withRouteData } from "app/components/app-router";
import { CdrVersionReactComponent } from "app/data-browser/cdr-version/cdr-version-info";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import { ErrorMessageReactComponent } from "app/data-browser/views/error-message/error-message-react.component";
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

import { GenomicCallToActionComponent } from "./genomic-call-to-action-react.component";

export const homeCss = `
.homePageLink {
	cursor: pointer;
	color: #337ab7 !important;
	text-decoration: underline;
}
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
	position:absolute;
	bottom:.25rem;
}
.result-bottom-link:hover {
	color: #262262;
}
.survey-result-boxes, .ehr-boxes {
	display: grid;
	grid-template-columns: repeat(4, minmax(239px, 1fr));
	column-gap:1rem;
	row-gap:1rem;
}

.genomic-boxes {
	display: grid;
	grid-template-columns: repeat(4, minmax(239px, 1fr));
	grid-area: gBoxes;
	column-gap: 1rem;
}
.pm-boxes{
	grid-area: pmBoxes;
	display: grid;
	grid-template-columns: repeat(4, minmax(239px, 1fr));
	grid-template-rows: 1fr;
	column-gap:1rem;
}
.genomic-pm {
	display:grid;
	grid-template-columns: 50% 50%;
	column-gap:1rem;
  padding-right:1rem;
  min-width: 56rem;
}

.result-box {
	cursor: pointer;
	min-width:239px;
	border-radius: 5px;
	background-color: #ffffff;
	box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
	padding: .5rem 1rem;
	position: relative;
}
.result-box-title {
	font-family: GothamBook, Arial, sans-serif;
	color: #3279b7;
	height: 2.5rem;
	margin-bottom:1rem;
	display: flex;
	justify-content: space-between;
}
.result-box-title-text {
	font-size: 16px;
}

.survey-result-boxes .result-box-body{
  padding-bottom:2rem;
}
.result-box-body {
	color: #302c71;
	font-family: GothamBook, Arial, sans-serif;
	font-size: 14px;
	display: flex;
	flex-direction: column;
	padding-bottom:4rem;
}
.result-box-body-item {
}
.participant-count {
	padding-bottom: 1rem;
}
.hgc-count-text {
	padding-bottom: 1rem;
}
.result-box-stat-label {
	padding-bottom:1rem;
	display:block;
}
.result-stat {
	display: block;
	color: #302c71;
	font-family: GothamBook, Arial, sans-serif;
	font-style: normal;
	font-weight: 400;
	font-size: 35px;
	line-height: 1em;
}
.search-faq-container {
	display: grid;
  grid-template-columns: 1fr minmax(239px, 1fr);
  grid-column-gap: 1rem;
	padding-left:1em;
  padding-right:1em;
  align-items: center;
}

.faq-btn-container {
  position: relative;
  display:flex;
  justify-content: center;
  align-items:center;
  margin-top: 1.4rem;
  min-width: 239px;
}

.faq-btn {
  background:#f6f6f8;
  display: block;
  border: #262262 1px solid;
  padding: 1rem;
  border-radius: 5px;
  font-size:27px;
  text-align: center;
  color:#302c71;
  width:35%;

}
.faq-btn:hover {
  color:#302c71;
}

.pm-boxes , .genomic-boxes{

	grid-template-columns: repeat(2, minmax(239px, 1fr));
	column-gap:1rem;
}
.pm-boxes  .result-box, .genomic-boxes .result-box{
  height: 18rem;
}
.result-box:last-of-type {
	margin-right: 0;
}
@media (max-width: 1048px) {

	.genomic-pm{
		grid-template-columns: 100%;
    padding-right: 0;
    min-width:0;
	}
	.survey-result-boxes, .ehr-boxes{
		grid-template-columns: repeat(3, minmax(239px, 1fr));
	}
  .pm-boxes, .genomic-boxes {
		width:auto;
		grid-template-columns: repeat(3, minmax(239px, 1fr));
	}
	.cope-preview {
		justify-content: flex-start;
	}
	.tooltip-container {
		padding-left: 1em;
	}
	.search-faq-container {
    grid-template-columns: 2fr 1fr;
	}
  .faq-btn-container {
    justify-content:left;
  }
  .faq-btn {
    width:50%;
  }
}
@media (max-width: 766px) {
	.result-boxes {
		grid-template-areas:'eHeading eHeading''eBoxes eBoxes''gHeading gHeading'' gBoxes gBoxes''pmHeading pmHeading''pmBoxes pmBoxes ';
	}
	.result-boxes, .survey-result-boxes, .ehr-boxes{
		grid-template-columns: repeat(1, minmax(239px, 1fr));
	}
	.pm-boxes, .genomic-boxes {
		width:auto;
		grid-template-columns: repeat(1, minmax(239px, 1fr));
	}
	.genomic-boxes{
		// grid-template-columns: repeat(2, minmax(239px, 1fr));
    margin-bottom:1rem;
	}
  div.genomic-pm > div:nth-child(1) > div > div:nth-child(1),
 div.genomic-pm > div:nth-child(2) > div > div:nth-child(1){
    margin-bottom: 1rem;
  }
  .result-box * {
    font-size: 1.05em;
  }
  body > app-public-aou > main > div:nth-child(2) > ng-component > div > section > div.result-boxes > div.genomic-pm > div:nth-child(1) > div > div:nth-child(3) {
    height: 22rem;
  }
  .result-stat {
    font-size: 1.6em;
  }

  .search-faq-container {
    grid-area: 2 1;
		grid-template-columns: 98.5%;
	}
  .faq-btn-container{
    grid-column: 1;
    order: -1;
    justify-content:center;
    margin-top:0;
    padding-bottom:4rem;
    padding-right:1rem;
  }
  .faq-btn {
    width:auto;
  }
}

    `;
const styles = reactStyles({
  toolTipContainer: {
    paddingLeft: "1em",
  },
  results: {
    padding: "16px",
  },

  resultBoxTitle: {
    color: "#337ab7",
    fontFamily: "GothamBook,Arial, sans-serif",
    display: "flex",
    margin: "0",
    fontSize: "16px",
    flexDirection: "row",
    height: "2rem",
    justifyContent: "space-between",
    alighItems: "center",
  },
  resultBody: {
    color: "#302c71",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "14px",
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
  resultBoxLink: {},
  resultHeading: {
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "23px",
    height: "0rem",
    paddingLeft: "0",
  },
  resultBodyItem: {},
  resultStat: {
    color: "#302c71",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontStyle: "normal",
    fontWeight: 400,
    fontSize: "35px",
    lineHeight: "1em",
  },
  genoResultStat: {
    color: "#302c71",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontStyle: "normal",
    lineHeight: "1em",
  },
  genoParticipantCount: {
    fontWeight: 400,
    fontSize: "14px",
  },
  dBTitle: {
    fontFamily: "GothamBold, Arial, sans-serif",
    fontWeight: "bold",
    textAlign: "center",
    margin: 0,
    padding: "16px",
  },
  dBDesc: {
    padding: "16px",
    paddingBottom: "63px",
    margin: "0 auto",
    lineHeight: "2",
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "20px",
    textAlign: "center",
  },
  dbSubDesc: {
    padding: "2rem",
    textAlign: "center",
  },
  resultBodyDescription: {},
});

interface ResultLinkProps {
  name: string;
  description?: string;
  description2?: string;
  questionCount?: number;
  standardConceptCount?: number;
  domain?: string;
  participantCount?: number;
  searchWord: string;
  domainType: string;
  wgsSRParticipantCount?: number;
  wgsLRParticipantCount?: number;
  wgsSVParticipantCount?: number;
  microarrayParticipantCount?: number;
  variantListSize?: number;
  loadingVariantListSize?: boolean;
  svVariantListSize?: number;
  loadingSVVariantListSize?: boolean;
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
      } else if (info.name === "SNVs/Indels") {
        const url = this.props.searchWord
          ? "snvsindels/" + this.props.searchWord
          : "snvsindels";
        NavStore.navigateByUrl(url);
      } else if (info.name === "Structural Variants") {
        const url = this.props.searchWord
          ? "structural-variants/" + this.props.searchWord
          : "structural-variants";
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
      wgsSRParticipantCount,
      wgsLRParticipantCount,
      wgsSVParticipantCount,
      microarrayParticipantCount,
      variantListSize,
      loadingVariantListSize,
      svVariantListSize,
      loadingSVVariantListSize,
      typing,
    } = this.props;

    return (
      <div onClick={() => this.resultClick(this.props)} className="result-box">
        <div className="result-box-title">
          <span className="result-box-title-text">{name}</span>
          <div>
            <TooltipReactComponent
              label="Homepage Tooltip Hover"
              action={"Hover on " + name + "tile tooltip"}
              tooltipKey={domain && domain.toLowerCase() === "genomics" ? domainType : (domain ? domain.toLowerCase() : name.toLowerCase())}
              searchTerm=""
            />
          </div>
        </div>
        <div className="result-box-body">
          {(domainType === "ehr" || domainType === "pmw") && (
            <span className="result-box-body-item">
              <span className="result-stat">
                {standardConceptCount.toLocaleString()}
              </span>
            </span>
          )}
          {domainType === "survey" && (
            <span className="result-box-body-item">
              <span className="result-stat">
                {questionCount.toLocaleString()}
              </span>
            </span>
          )}
          {/* SNVs/Indels without search */}
          {domainType === "snvs" && name === "SNVs/Indels" && !searchWord && (
            <React.Fragment>
              <span className="result-box-body-item">
                <span className="result-stat">
                  {wgsSRParticipantCount.toLocaleString()}
                </span>
                <div style={{ paddingTop: ".25rem" }}>
                  {" "}
                  Participants in Short-Read <br></br>
                  Whole Genome Sequencing <br></br>
                  (WGS) dataset
                </div>

                <React.Fragment>
                  <span
                    style={{ paddingTop: "1rem", fontSize: "28px" }}
                    className="result-stat"
                  >
                    {variantListSize.toLocaleString()}
                  </span>
                  <span className="result-box-stat-label">
                    SNVs/Indels
                  </span>
                </React.Fragment>
              </span>
            </React.Fragment>
          )}
          {/* Structural Variants without search */}
          {domainType === "svs" && name === "Structural Variants" && !searchWord && (
            <React.Fragment>
              <span className="result-box-body-item">
                <span className="result-stat">
                  {wgsSVParticipantCount.toLocaleString()}
                </span>
                <div style={{ paddingTop: ".25rem" }}>
                  Participants in the Short-Read WGS Structural Variants dataset
                </div>

                <React.Fragment>
                  <span
                    style={{ paddingTop: "1rem", fontSize: "28px" }}
                    className="result-stat"
                  >
                    {svVariantListSize.toLocaleString()}
                  </span>
                  <span className="result-box-stat-label">
                    Structural Variants
                  </span>
                </React.Fragment>

              </span>
            </React.Fragment>
          )}
          {searchWord && domainType === "ehr" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">
                matching medical concepts
              </span>
            </span>
          )}
          {searchWord && domainType === "survey" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">
                matching survey questions
              </span>
            </span>
          )}
          {searchWord && name.toLowerCase() === "physical measurements" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">
                matching Physical Measurements
              </span>
            </span>
          )}
          {searchWord && name.toLowerCase() === "fitbit" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">
                matching Fitbit Measurements
              </span>
            </span>
          )}
          {!searchWord && domainType === "ehr" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">medical concepts</span>
            </span>
          )}
          {!searchWord && domainType === "survey" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">questions available</span>
            </span>
          )}
          {!searchWord && name.toLowerCase() === "physical measurements" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">
                Physical Measurements
              </span>
            </span>
          )}
          {!searchWord && name.toLowerCase() === "fitbit" && (
            <span className="result-box-body-item">
              <span className="result-box-stat-label">Fitbit Measurements</span>
            </span>
          )}
          {participantCount && !(domainType === "snvs") && (
            <span className="result-box-body-item participant-count">
              <strong> {participantCount.toLocaleString()}</strong> participants
            </span>
          )}
          {/* SNVs/Indels with search */}
          {domainType === "snvs" &&
            name === "SNVs/Indels" &&
            searchWord &&
            !loadingVariantListSize &&
            variantListSize > 0 && (
              <React.Fragment>
                <span className="result-box-body-item">
                  <span className="result-stat">
                    {wgsSRParticipantCount.toLocaleString()}
                  </span>
                  <div style={{ paddingTop: ".25rem" }}>
                    {" "}
                    Participants in Short-Read <br></br>
                    Whole Genome Sequencing <br></br>
                    (WGS) dataset
                  </div>

                  <React.Fragment>
                    <span
                      style={{ paddingTop: "1rem", fontSize: "28px" }}
                      className="result-stat"
                    >
                      {variantListSize.toLocaleString()}
                    </span>
                    <span className="result-box-stat-label">
                      SNVs/Indels
                    </span>
                  </React.Fragment>
                </span>
              </React.Fragment>
            )}
          {/* Structural Variants with search */}
          {domainType === "svs" &&
            name === "Structural Variants" &&
            searchWord &&
            !loadingSVVariantListSize &&
            svVariantListSize > 0 && (
              <React.Fragment>
                <span className="result-box-body-item">
                  <span className="result-stat">
                    {wgsSVParticipantCount.toLocaleString()}
                  </span>
                  <div style={{ paddingTop: ".25rem" }}>
                    Participants in Short-Read <br></br>
                    WGS Structural Variants dataset
                  </div>

                  <React.Fragment>
                    <span
                      style={{ paddingTop: "1rem", fontSize: "28px" }}
                      className="result-stat"
                    >
                      {svVariantListSize.toLocaleString()}
                    </span>
                    <span className="result-box-stat-label">
                      Structural Variants
                    </span>
                  </React.Fragment>
                </span>
              </React.Fragment>
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
          ) : name === "SNVs/Indels" ? (
            <a className="result-bottom-link">View SNVs/Indels</a>
          ) : name === "Structural Variants" ? (
            <a className="result-bottom-link">View Structural Variants</a>
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
  svVariantListSize: number;
  loadingSVVariantListSize: boolean;
  physicalMeasurementsInfo: any[];
  searchWord: string;
  popUp: boolean;
  loading: boolean;
  winWidth: any;
  winHeight: any;
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
        svVariantListSize: null,
        loadingSVVariantListSize: false,
        physicalMeasurementsInfo: [],
        searchWord: localStorage.getItem("searchText")
          ? localStorage.getItem("searchText")
          : "",
        popUp: false,
        loading: true,
        winWidth: window.innerWidth,
        winHeight: window.innerHeight,
      };
    }

    changeUrl() {
      const { searchWord } = this.state;
      let url = "/";
      if (searchWord) {
        url += "?search=" + encodeURIComponent(searchWord);
      }
      window.history.pushState(null, "Data Browser", url);
    }

    handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const searchWord = urlParams.get('search') || '';

      this.setState({ searchWord, loading: true }, () => {
        localStorage.setItem("searchText", searchWord);
        this.getDomainInfos();
        this.getVariantResultSize();
        this.getSVVariantResultSize();
      });
    }

    search = _.debounce((val) => {
      this.typing = true;
      this.getDomainInfos();
      this.getVariantResultSize();
      this.getSVVariantResultSize();
      this.changeUrl();
    }, 1000);

    handleChange(val) {
      this.setState({ loading: true });
      this.setState({ searchWord: val }, () => {
        localStorage.setItem("searchText", val);
      });
      this.search(val);
      this.typing = false;
    }

    iconClickEvent(iconString: string) {
      if (iconString === "introductory-videos") {
        NavStore.navigateByUrl("/" + iconString);
      }
    }

    componentDidMount() {
      // Initialize search from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search');
      if (urlSearch && urlSearch !== this.state.searchWord) {
        this.setState({ searchWord: urlSearch }, () => {
          localStorage.setItem("searchText", urlSearch);
        });
      }

      this.getDomainInfos();
      this.getVariantResultSize();
      this.getSVVariantResultSize();
      this.getGenomicParticipantCounts();
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("popstate", this.handlePopState);
    }

    componentWillUnmount() {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("popstate", this.handlePopState);
    }

    getGenomicParticipantCounts() {
      return genomicsApi()
        .getParticipantCounts()
        .then((result) => {
          if (result.results) {
            genomicTileMetadata.wgsSRParticipantCount = result.results.filter(
              (r) => r.stratum4 === "wgs_shortread"
            )[0].countValue;
            genomicTileMetadata.wgsLRParticipantCount = result.results.filter(
              (r) => r.stratum4 === "wgs_longread"
            )[0].countValue;
            genomicTileMetadata.wgsSVParticipantCount = result.results.filter(
              (r) => r.stratum4 === "wgs_structural_variants"
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
      this.setState({ loadingVariantListSize: true });
      const variantSizeRequest = {
        query: searchWord,
        filterMetadata: null,
      };
      genomicsApi()
        .getVariantSearchResultSize(variantSizeRequest)
        .then((result) => {
          this.setState({
            variantListSize: result,
            loadingVariantListSize: false,
          });
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loadingVariantListSize: false });
        });
    }

    getSVVariantResultSize() {
      const { searchWord } = this.state;
      this.setState({ loadingSVVariantListSize: true });
      const variantSizeRequest = {
        query: searchWord,
        filterMetadata: null,
      };
      genomicsApi()
        .getSVVariantSearchResultSize(variantSizeRequest)
        .then((result) => {
          this.setState({
            svVariantListSize: result,
            loadingSVVariantListSize: false,
          });
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loadingSVVariantListSize: false });
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

    handleResize = () => {
      this.setState({
        winWidth: window.innerWidth,
        winHeight: window.innerHeight,
      });
    };

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
        svVariantListSize,
        loadingSVVariantListSize,
        winHeight,
        winWidth,
      } = this.state;
      const noResults =
        domainInfo.length === 0 &&
        physicalMeasurementsInfo.length === 0 &&
        surveyInfo.length === 0 &&
        variantListSize === 0 &&
        svVariantListSize === 0;
      const noConceptData =
        domainInfo.length === 0 &&
        physicalMeasurementsInfo.length === 0 &&
        surveyInfo.length === 0;

      const showGenomicsSection = environment.geno && genomicInfo &&
        (!loadingVariantListSize && !loadingSVVariantListSize) &&
        ((!searchWord && (variantListSize > 0 || svVariantListSize !== null)) ||
         (searchWord && (variantListSize > 0 || svVariantListSize > 0)));

      return (
        <React.Fragment>
          <style>{homeCss}</style>
          <h1 style={{ ...globalStyles.primaryDisplay, ...styles.dBTitle }}>
            Data Browser
          </h1>
          <p style={{ ...globalStyles.bodyLead, ...styles.dBDesc }}>
            Browse aggregate-level data contributed by <i>All of Us</i>&#32;
            research participants. Data are derived from multiple&#32;
            <a
              href="https://www.researchallofus.org/data-tools/data-sources/"
              className="homePageLink"
              target="_blank"
            >
              data sources
            </a>
            . To protect participant privacy, we have removed personal
            identifiers, rounded aggregate data to counts of 20, and only
            included summary demographic information. Individual-level data are
            available for analysis in the&#32;
            <a
              href="https://www.researchallofus.org/data-tools/workbench/"
              className="homePageLink"
              target="_blank"
            >
              Researcher Workbench
            </a>
            .
            <br />
          </p>
          <div className="search-faq-container">
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
            <div className="faq-btn-container">
              <a
                className="faq-btn"
                style={{ color: "#302c71" }}
                href={
                  environment.researchAllOfUsUrl +
                  "/frequently-asked-questions/#data-browser-faqs"
                }
              >
                FAQ
              </a>
            </div>
          </div>

          {loading || loadingVariantListSize || loadingSVVariantListSize ? (
            <div
              style={{
                height: "15vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spinner />
            </div>
          ) : (
            <section style={styles.results}>
              {noConceptData && variantListSize === 0 && svVariantListSize === 0 && (
                <ErrorMessageReactComponent dataType="noResults" />
              )}
              {true && (
                <div
                  className={`result-boxes ${
                    physicalMeasurementsInfo.length > 0 && searchWord
                      ? "has-pm"
                      : ""
                  }  `}
                >
                  {domainInfo.length > 0 && (
                    <h5
                      style={{
                        ...globalStyles.secondaryDisplay,
                        ...styles.resultHeading,
                        gridArea: "eHeading",
                      }}
                    >
                      <span style={{ position: "relative", bottom: "2px" }}>
                        Electronic Health Records (EHR)
                      </span>
                    </h5>
                  )}
                  {domainInfo.length > 0 && (
                    <React.Fragment>
                      <div className="ehr-boxes">
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
                      </div>
                    </React.Fragment>
                  )}
                  <div className="genomic-pm">
                    {showGenomicsSection && (
                      <div>
                        <h5
                          style={{
                            ...globalStyles.secondaryDisplay,
                            ...styles.resultHeading,
                            gridArea: "gHeading",
                          }}
                        >
                          <span
                            style={{ position: "relative", bottom: "2px" }}
                          >
                            Genomics
                          </span>
                        </h5>
                        <div className="genomic-boxes">
                          {/* SNVs/Indels tile - show if no search OR if search has results */}
                          {(!searchWord || (searchWord && variantListSize > 0)) && (
                            <ResultLinksComponent
                              typing={!this.typing}
                              key="genomics-tile"
                              searchWord={searchWord}
                              {...genomicInfo}
                              name="SNVs/Indels"
                              domainType="snvs"
                              variantListSize={variantListSize}
                              loadingVariantListSize={loadingVariantListSize}
                            />
                          )}

                          {/* Structural Variants tile - show if no search OR if search has results */}
                          {(!searchWord || (searchWord && svVariantListSize > 0)) && (
                            <ResultLinksComponent
                              typing={!this.typing}
                              key="sv-genomics-tile"
                              searchWord={searchWord}
                              {...genomicInfo}
                              name="Structural Variants"
                              domainType="svs"
                              svVariantListSize={svVariantListSize}
                              loadingSVVariantListSize={loadingSVVariantListSize}
                            />
                          )}

                        </div>
                      </div>
                    )}
                    {physicalMeasurementsInfo.length > 0 && (
                      <div>
                        <h5
                          style={{
                            ...globalStyles.secondaryDisplay,
                            ...styles.resultHeading,
                            gridArea: "pmHeading",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span style={{ position: "relative", bottom: "2px" }}>
                            Measurements & Wearables
                          </span>
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
                                  loadingVariantListSize={
                                    loadingVariantListSize
                                  }
                                />
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {surveyInfo.length > 0 && (
                <React.Fragment>
                  <h5
                    style={{
                      ...globalStyles.secondaryDisplay,
                      ...styles.resultHeading,
                      marginTop: "3rem",
                    }}
                  >
                    Surveys
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