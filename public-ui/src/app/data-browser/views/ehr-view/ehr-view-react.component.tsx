import * as React from "react";
import ReactPaginate from "react-paginate";
import _ from "lodash";
import { faVial } from "@fortawesome/free-solid-svg-icons";
import { faFileSignature } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { withRouteData } from "app/components/app-router";
import { NoResultSearchComponent } from "app/components/db-no-results/no-results-search.component";
import { TopResultsChartReactComponent } from "app/data-browser/charts/chart-top-results/chart-top-results-react.component";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import { ConceptRowReactComponent } from "app/data-browser/views/ehr-view/components/concept-row-react.component";
import { dataBrowserApi } from "app/services/swagger-fetch-clients";
import { PopUpReactComponent } from "app/shared/components/pop-up/PopUpReactComponent";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { PM_CONCEPTS, routeToDomain } from "app/utils/constants";
import { GraphType } from "app/utils/enum-defs";
import { triggerEvent } from "app/utils/google_analytics";
import { navigateByUrl, urlParamsStore } from "app/utils/navigation";
import { Spinner } from "app/utils/spinner";
import {
  Domain,
  MatchType,
  StandardConceptFilter,
} from "publicGenerated/fetch";

const styles = reactStyles({
  searchLink: {
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "14px",
    cursor: "pointer",
  },
  results: {
    paddingTop: "36px",
    width: "100%",
    padding: "18px",
  },
  dbAlert: {
    fontSize: "15px",
    display: "block",
    color: "#262262",
    backgroundColor: "#E1F1F6",
    borderRadius: "1.2em",
    padding: "0.8em",
    lineHeight: "1.5",
    margin: "1em",
  },
  pageHeader: {
    padding: "18px",
  },
  medlineLink: {
    fontSize: "14px",
    color: "#262262",
    background: "#f6f6f8",
    borderRadius: "10px",
    padding: ".5rem 1rem",
    lineHeight: "1.5",
    margin: "0.5rem 0",
  },
  resultsGrid: {
    width: "100%",
    background: "white",
    padding: "18px",
  },
  dropdownToggle: {
    background: "transparent",
    border: "none",
    marginLeft: "0.2em",
  },
});

const cssStyles = `
@media (max-width: 900px) {
    .results-grid {
        overflow-x: scroll;
    }
}

@media (max-width: 768px) {
  .top-results-container {
    display: none; /* Hide top results on mobile */
  }
}

.dropbtn {
  background-color: #04AA6D;
  color: white;
  border: none;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  margin-top: 0.6em;
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.domain-info-layout {
    display: flex;
    justify-content: space-between;
    align-items: end;
    
}

.primary-display
{
  font-size: 20px;
  font-stretch: normal;
  line-height: 18px;
  margin:.5rem 0 ;
}
.domain-summary{
  margin:0;
}
.search-bar-container {
    padding: 18px;
}
.disclaimer-btn {
    font-size:.7em;
    padding: .5em 1em;
    cursor: pointer;
}
.disclaimer-btn:hover {
  background: #262262;
  color: #fff;
}
.toggle-link {
  cursor: pointer;
}
.secondary-display,
h2 {
  font-family: "GothamBook", "Arial", sans-serif;
  font-weight: 200;
  font-style: normal;
  font-size: 27px;
  font-stretch: normal;
  line-height: 1.47em;
  letter-spacing: normal;
  text-align: left;
}
h5.secondary-display {
    font-size: 20px;
    font-family: GothamBook, Arial, sans-serif;
    font-weight: 100;
}
h5.secondary-display {
    padding: 18px;
    font-size: 1.3em;
}
.toggle-icon {
    display: inline;
    margin-left: .2em;
}
.domain-title {
  font-family:GothamBook Arial, sans-serif;
  font-size: 36.8px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 45.36px;
  letter-spacing: normal;
  text-align: left;
}
.tbl-head .tbl-d::before {
    content: '';
    position: absolute;
    width: 10px;
    height: 20px;
    background: url('/assets/icons/divider.svg');
    background-repeat: no-repeat;
    left: -10px;
    padding-right: 1rem;
}

.tbl-head .tbl-d:first-of-type::before {
    content: none;
}

.tbl-r.tbl-head {
    background: #f6f6f8;
    border: 1px solid #CCCCCC;
    padding: .5rem 0;
    border-radius: 3px 3px 0 0;
    position: sticky;
    top:0px;
    z-index:100;
}

.tbl-exp-r:first-of-type {
    border-top: none;
}

.tbl-r {
    display: grid;
    grid-template-columns: 30% 25% 20% 1fr;
    text-align: left;
    min-width: 810px;
}

.tbl-r_labs {
    display: grid;
    grid-template-columns: 30% 25% 20% 10% 1fr;
    text-align: left;
    min-width: 810px;
}

.tbl-r_labs .tbl-d:nth-of-type(4) {
    text-align: center;
}

.tbl-d {
    padding: 0 .5rem;
    font-size: .8em;
    position: relative;
}

.row-expansion {
    width: 100%;
    text-align: center;
    padding-top: 9px;
    background: white;
    border-top: none;
    padding-bottom: 27px;
    cursor: default;
}

.tbl-r-state {
    background: #f6f6f8;
}

.tbl-r-expanded {
    border-left: 1px solid #CCCCCC;
    border-right: 1px solid #CCCCCC;
}

.tbl-exp-r {
    border: 1px solid #CCCCCC;
    border-bottom: none;
    cursor: pointer;
    transition: .2s background ease-out;
    padding: 9px;
    padding-top:20px;
    min-width: 810px;
}

.tbl-exp-r *.tbl-exp-r {
    border-left: none;
    border-right: none;
    padding: 0.5rem 0;
    min-width: auto;
}

.tbl-exp-r:last-of-type {
    border-bottom: 1px solid #CCCCCC;
}

.tbl-exp-r:hover {
    background: #f6f6f8;
    transition: .1s background ease-in;
}

.tbl-r {
    border: none;
}

.clr-checkbox-wrapper {
    display: flex;
    flex-direction: row;
}

.checkbox-input {
    margin-left: 0.5em;
    margin-right: 0.5em;
    margin-bottom: 1em;
    text-align: left;
}
.checkbox-label {
    margin-left: 0.3em;
}
`;
interface State {
  domain: any;
  domainId: string;
  totalParticipants: number;
  title: string;
  subTitle: string;
  searchWord: string;
  showStatement: boolean;
  standardConcepts: any;
  standardConceptIds: any;
  showTopConcepts: boolean;
  matchType: MatchType;
  concepts: any;
  top10Results: any;
  loading: boolean;
  selectedConcept: any;
  numPages: number;
  totalResults: number;
  currentPage: number;
  medlinePlusLink: string;
  medlineTerm: string;
  selectedMeasurementTypeFilter: boolean;
  measurementTestFilter: boolean;
  measurementOrderFilter: boolean;
  endReached: boolean;
}

export const EhrViewReactComponent = withRouteData(
  class extends React.Component<{}, State> {
    constructor(props: {}) {
      super(props);
      this.changeResults = this.changeResults.bind(this);
      // TODO add url params and change them based on search value
      const { search } = urlParamsStore.getValue();
      this.state = {
        domainId: urlParamsStore.getValue().id,
        domain: null,
        totalParticipants: 0,
        title: "",
        subTitle: "",
        searchWord: search,
        showStatement: false,
        top10Results: null,
        selectedConcept: null,
        standardConceptIds: "",
        numPages: null,
        totalResults: null,
        concepts: [],
        standardConcepts: [],
        currentPage: 1,
        loading: true,
        medlinePlusLink: null,
        medlineTerm: null,
        selectedMeasurementTypeFilter: false,
        measurementTestFilter: true,
        measurementOrderFilter: true,
        showTopConcepts: true,
        matchType: MatchType.NAME,
        endReached: false,
      };
    }
    debounceTimer = null;
    domainTotals = _.debounce(() => {
      this.setState({ loading: true }, () => {
        this.getDomainTotals();
        this.getTopConcepts();
        this.changeUrl();
      });
    }, 1000);

    componentDidMount() {
      this.getDomainTotals();
      window.addEventListener("scroll", this.handleScrollEnd);
    }

    componentWillUnmount(): void {
      window.removeEventListener("scroll", this.handleScrollEnd);
    }

    changeUrl() {
      let url = "ehr/" + this.state.domainId;
      if (this.state.searchWord) {
        url += "/" + this.state.searchWord;
      }
      window.history.replaceState(null, "Ehr View", url);
    }

    getDomainTotals() {
      const { searchWord, measurementTestFilter, measurementOrderFilter } =
        this.state;
      dataBrowserApi()
        .getDomainTotals(
          searchWord,
          measurementTestFilter ? 1 : 0,
          measurementOrderFilter ? 1 : 0
        )
        .then((results) => {
          results.domainInfos.forEach((domain) => {
            const thisDomain = Domain[domain.domain];
            if (
              thisDomain &&
              thisDomain.toLowerCase() === routeToDomain[this.state.domainId]
            ) {
              this.setState(
                {
                  domain: domain,
                  title: domain.name,
                  subTitle: "Keyword: " + searchWord,
                  totalParticipants: domain.participantCount,
                  numPages: Math.ceil(domain.standardConceptCount / 50),
                  totalResults: domain.standardConceptCount,
                },
                () => {
                  this.getTopConcepts();
                }
              );
            }
          });
        })
        .catch((e) => {
          console.log(e, "error");
        });
    }

    processSearchResults(results, append: boolean) {
      const { searchWord, top10Results, currentPage, domain } = this.state;
      results.items = results.items
        .filter((x) => PM_CONCEPTS.indexOf(x.conceptId) === -1)
        .sort((a, b) => b.countValue - a.countValue);
      let medlineTerm = searchWord ? searchWord : "";
      if (
        results.matchType === MatchType.ID ||
        results.matchType === MatchType.CODE
      ) {
        medlineTerm = results.matchedConceptName;
      }
      const medlinePlusLink =
        "https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=" +
        "medlineplus&v%3Asources=medlineplus-bundle&query=" +
        medlineTerm;
      let conceptStandardConcepts: any[] = [];
      for (const concept of results.items) {
        concept.synonymString = concept.conceptSynonyms.join(", ");
        concept.drugBrands = concept.drugBrands;
        if (domain.domain.toLowerCase() === "measurement") {
          concept.graphToShow = GraphType.Values;
        } else {
          concept.graphToShow = GraphType.BiologicalSex;
        }
        if (concept.standardConcepts) {
          conceptStandardConcepts = conceptStandardConcepts.concat(
            concept.standardConcepts
          );
        }
      }
      this.setState({
        concepts: append
          ? [...this.state.concepts, ...results.items]
          : results.items,
        standardConcepts: conceptStandardConcepts,
        standardConceptIds: conceptStandardConcepts.map((a) => a.conceptId),
        matchType: results.matchType,
        top10Results:
          currentPage === 1
            ? results.items.slice(0, 10)
            : top10Results
            ? top10Results
            : results.items.slice(0, 10),
        loading: false,
        medlineTerm: medlineTerm,
        medlinePlusLink: medlinePlusLink,
      });
    }

    getTopConcepts() {
      const {
        searchWord,
        domain: { domain, name },
        measurementTestFilter,
        measurementOrderFilter,
      } = this.state;
      const searchRequest = {
        query: searchWord ? searchWord : "",
        domain: domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH,
        maxResults: 50,
        minCount: 1,
        pageNumber: 0,
        measurementTests: measurementTestFilter ? 1 : 0,
        measurementOrders: measurementOrderFilter ? 1 : 0,
      };
      if (searchWord) {
        triggerEvent(
          "domainPageSearch",
          "Search",
          "Search Inside Domain " + name,
          "Domain Search",
          searchWord,
          null
        );
      }
      this.fetchConcepts(searchRequest, false);
    }

    fetchConcepts(searchRequest: any, append: boolean) {
      dataBrowserApi()
        .searchConcepts(searchRequest)
        .then((results) => {
          this.processSearchResults(results, append);
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loading: false });
        });
    }

    handleChange(val) {
      this.setState(
        { searchWord: val, currentPage: 1, showTopConcepts: true },
        () => {
          localStorage.setItem("searchText", val);
        }
      );
      this.domainTotals();
    }

    backToMain() {
      if (this.state.searchWord) {
        localStorage.setItem("searchText", this.state.searchWord);
      }
      navigateByUrl("");
    }

    selectConcept(concept: any) {
      const { currentPage } = this.state;
      if (concept && currentPage > 1) {
        this.setState({ selectedConcept: concept, currentPage: 1 }, () => {
          this.getTopConcepts();
        });
      } else {
        this.setState({ selectedConcept: concept });
      }
    }

    getTopResultsSize() {
      const { top10Results, title } = this.state;
      return top10Results
        ? top10Results.length === 1
          ? top10Results.length + " " + title.slice(0, -1)
          : top10Results.length < 10
          ? top10Results.length + " " + title
          : 10 + " " + title
        : "No results available";
    }

    addMoreResults = () => {
      const data = this.state.currentPage;

      const {
        searchWord,
        domain: { domain },
        measurementTestFilter,
        measurementOrderFilter,
      } = this.state;
      const searchRequest = {
        query: searchWord ? searchWord : "",
        domain: domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.STANDARD_OR_CODE_ID_MATCH,
        maxResults: 50,
        minCount: 1,
        pageNumber: data,
        measurementTests: measurementTestFilter ? 1 : 0,
        measurementOrders: measurementOrderFilter ? 1 : 0,
      };
      this.setState({
        currentPage: data + 1,
      });
      this.fetchConcepts(searchRequest, true);
    };

    handleScrollEnd = (event) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        // Calculate the height of the viewport
        const viewportHeight = window.innerHeight;

        // Calculate the scroll position as a percentage
        const scrollPosition =
          (window.scrollY /
            (document.documentElement.scrollHeight - viewportHeight)) *
          100;
        if (scrollPosition >= 60) {
          // You can perform your actions here
          this.addMoreResults();
        }
      }, 150);
      // Detect when it is scrolled down 60%
    };

    changeResults() {
      this.setState({ selectedConcept: null });
    }

    flipMeasurementTypeFilter() {
      const { selectedMeasurementTypeFilter } = this.state;
      this.setState({
        selectedMeasurementTypeFilter: !selectedMeasurementTypeFilter,
      });
    }

    getDropdownDisplayStyle() {
      if (this.state.selectedMeasurementTypeFilter) {
        return { display: "block" };
      }
      return { display: "none" };
    }
    handleEnd() {}

    render() {
      const {
        title,
        searchWord,
        showStatement,
        showTopConcepts,
        domain,
        totalResults,
        totalParticipants,
        selectedConcept,
        numPages,
        loading,
        medlinePlusLink,
        medlineTerm,
        concepts,
        standardConcepts,
        standardConceptIds,
        matchType,
        selectedMeasurementTypeFilter,
        currentPage,
        measurementTestFilter,
        measurementOrderFilter,
        top10Results,
        endReached,
      } = this.state;
      const maxResults = 50;
      const noMatchFilter = 1;
      const dropdownClass = selectedMeasurementTypeFilter
        ? "dropdown bottom-left open"
        : "dropdown bottom-left";
      const filterIconClass = selectedMeasurementTypeFilter
        ? "filter-grid-icon is-solid"
        : "filter-grid-icon";
      return (
        <React.Fragment>
          <div onScroll={this.handleScrollEnd}>
            <style>{cssStyles}</style>
            <div className="page-header" style={styles.pageHeader}>
              {title && <h2 className="domain-title">{title}</h2>}
            </div>
            <div className="search-bar-container">
              <SearchComponent
                value={searchWord || ""}
                searchTitle=""
                domain="ehr"
                onChange={(val) => this.handleChange(val)}
                onClear={() => this.handleChange("")}
                placeholderText="Keyword Search"
              />
            </div>
            {loading && <Spinner />}
            {domain &&
              !loading &&
              ((concepts && concepts.length > 0) ||
                (domain.domain.toLowerCase() === "measurement" &&
                  !measurementTestFilter &&
                  !measurementOrderFilter)) && (
                <div className="results" style={styles.results}>
                  <a
                    className="btn btn-link btn-sm main-search-link"
                    style={styles.searchLink}
                    onClick={() => this.backToMain()}
                  >
                    &lt; Back to main search{" "}
                  </a>
                  <div className="result-list">
                    <div className="db-card">
                      <div className="db-card-inner">
                        <section>
                          <div className="top-results-container">
                            <h5 className="secondary-display domain-summary">
                              <React.Fragment>
                                <div
                                  className="toggle-link"
                                  onClick={() =>
                                    this.setState({
                                      showTopConcepts: !showTopConcepts,
                                    })
                                  }
                                >
                                  Top {this.getTopResultsSize()} by Descending
                                  Participant Counts
                                  <div className="toggle-icon">
                                    {showTopConcepts ? (
                                      <ClrIcon
                                        shape="caret"
                                        dir="down"
                                        style={{ width: 20, height: 20 }}
                                      />
                                    ) : (
                                      <ClrIcon
                                        shape="caret"
                                        dir="right"
                                        style={{ width: 20, height: 20 }}
                                      />
                                    )}
                                  </div>
                                </div>
                                {showTopConcepts && top10Results && top10Results.length > 0 && (
                                  <TopResultsChartReactComponent
                                    concepts={top10Results}
                                    onClick={(e) => this.selectConcept(e)}
                                  />
                                )}
                              </React.Fragment>
                            </h5>
                          </div>
                        </section>
                        <section>
                          <div
                            className="results-grid"
                            style={styles.resultsGrid}
                          >
                            <React.Fragment>
                              <div className="domain-info-layout">
                                <span>
                                  {totalResults <= 50 ? (
                                    <h5
                                      id="domain-name"
                                      className="primary-display"
                                    >
                                      &#32;{totalResults.toLocaleString()}&#32;
                                      {searchWord ? (
                                        <React.Fragment>
                                          {" "}
                                          matching medical concepts{" "}
                                        </React.Fragment>
                                      ) : (
                                        <React.Fragment>
                                          {" "}
                                          concepts for this domain
                                        </React.Fragment>
                                      )}
                                      <TooltipReactComponent
                                        tooltipKey="matchingConceptsHelpText"
                                        label="EHR Tooltip Hover"
                                        searchTerm={searchWord}
                                        action="Matching medical concepts tooltip hover"
                                      />
                                    </h5>
                                  ) : (
                                    <h5
                                      id="domain-name"
                                      className="primary-display"
                                    >
                                      {totalResults.toLocaleString()}&#32;
                                      {searchWord ? (
                                        <React.Fragment>
                                          {" "}
                                          matching medical concepts{" "}
                                        </React.Fragment>
                                      ) : (
                                        <React.Fragment>
                                          {" "}
                                          concepts for this domain
                                        </React.Fragment>
                                      )}
                                      <TooltipReactComponent
                                        tooltipKey="matchingConceptsHelpText"
                                        label="EHR Tooltip Hover"
                                        searchTerm={searchWord}
                                        action="Matching medical concepts tooltip hover"
                                      />{" "}
                                    </h5>
                                  )}
                                </span>
                                {searchWord && (
                                  <h6
                                    className="medline-link"
                                    style={styles.medlineLink}
                                  >
                                    Interested in general health information
                                    related to "{medlineTerm}"?
                                    <br />
                                    <a
                                      href={medlinePlusLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Search MedlinePlus
                                    </a>
                                  </h6>
                                )}
                              </div>
                              {concepts.length === 1 &&
                                concepts[0].standardConcept !== "S" &&
                                standardConcepts.length > 0 && (
                                  <div
                                    className="db-alert"
                                    style={styles.dbAlert}
                                  >
                                    Note: {concepts[0].vocabularyId}{" "}
                                    {concepts[0].conceptCode}'
                                    {concepts[0].conceptName}' maps to Standard
                                    Vocabulary{" "}
                                    {standardConcepts[0].vocabularyId}
                                    {standardConcepts[0].conceptCode} '
                                    {standardConcepts[0].conceptName}'. Standard
                                    vocabularies capture data across a variety
                                    of source vocabularies.
                                  </div>
                                )}
                              <div className="tbl-r tbl-head">
                                <div className="tbl-d body-lead">
                                  {" "}
                                  {domain.name}
                                  <TooltipReactComponent
                                    tooltipKey={domain.domain.toLowerCase()}
                                    label="EHR Tooltip Hover"
                                    searchTerm={searchWord}
                                    action="Domain name tooltip hover in matching concepts table"
                                  />
                                </div>
                                <div className="tbl-d body-lead">
                                  {" "}
                                  Participants of{" "}
                                  {totalParticipants.toLocaleString()}
                                  <TooltipReactComponent
                                    tooltipKey="participantCountHelpText"
                                    label="EHR Tooltip Hover"
                                    searchTerm={searchWord}
                                    action="Participant count tooltip hover"
                                  />
                                </div>
                                <div className="tbl-d body-lead">
                                  {" "}
                                  % of {totalParticipants.toLocaleString()}
                                  <TooltipReactComponent
                                    tooltipKey="percentageOfParticipants"
                                    label="EHR Tooltip Hover"
                                    searchTerm={searchWord}
                                    action="Percentage of participant count tooltip hover"
                                  />
                                </div>

                                {domain.domain.toLowerCase() ===
                                  "measurement" && (
                                  <div className="tbl-d body-lead info-text">
                                    Data Type
                                    <div className="dropdown">
                                      <button
                                        className="dropbtn"
                                        style={styles.dropdownToggle}
                                      >
                                        <ClrIcon
                                          shape="filter-grid"
                                          className={filterIconClass}
                                          onClick={() =>
                                            this.flipMeasurementTypeFilter()
                                          }
                                        />
                                      </button>
                                      <div
                                        className="dropdown-content"
                                        style={this.getDropdownDisplayStyle()}
                                      >
                                        <div className="checkbox-input">
                                          <input
                                            type="checkbox"
                                            id="checkbox1"
                                            className="clr-checkbox"
                                            onClick={() =>
                                              this.setState(
                                                {
                                                  measurementTestFilter:
                                                    !measurementTestFilter,
                                                },
                                                () => {
                                                  this.getDomainTotals();
                                                  this.getTopConcepts();
                                                }
                                              )
                                            }
                                            defaultChecked={
                                              measurementTestFilter
                                            }
                                          />
                                          <label
                                            htmlFor="checkbox1"
                                            className="checkbox-label"
                                          >
                                            <FontAwesomeIcon
                                              icon={faVial}
                                              style={{
                                                transform: "rotate(315deg)",
                                              }}
                                            />
                                            Tests
                                          </label>
                                        </div>
                                        <div className="checkbox-input">
                                          <input
                                            type="checkbox"
                                            id="checkbox2"
                                            className="clr-checkbox"
                                            onClick={() =>
                                              this.setState(
                                                {
                                                  measurementOrderFilter:
                                                    !measurementOrderFilter,
                                                },
                                                () => {
                                                  this.getDomainTotals();
                                                  this.getTopConcepts();
                                                }
                                              )
                                            }
                                            defaultChecked={
                                              measurementOrderFilter
                                            }
                                          />
                                          <label
                                            htmlFor="checkbox2"
                                            className="checkbox-label"
                                          >
                                            <FontAwesomeIcon
                                              icon={faFileSignature}
                                            />{" "}
                                            Orders
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {concepts && concepts.length > 0 && (
                                <div className="tbl-body scroll-area">
                                  {standardConcepts
                                    .concat(concepts)
                                    .map((concept, index) => {
                                      return (
                                        <ConceptRowReactComponent
                                          key={concept.conceptId}
                                          concept={concept}
                                          domain={domain}
                                          totalResults={totalResults}
                                          maxResults={maxResults}
                                          currentPage={1} // always on page one if infinite
                                          counter={index}
                                          searchTerm={searchWord}
                                          totalParticipants={totalParticipants}
                                          selectedConcept={selectedConcept}
                                          synonymString={concept.conceptSynonyms.join(
                                            ", "
                                          )}
                                          matchType={matchType}
                                          match={
                                            standardConceptIds.indexOf(
                                              concept.conceptId
                                            ) >= 0
                                              ? "standard"
                                              : "source"
                                          }
                                          endReached={() =>
                                            this.setState({ endReached: true })
                                          }
                                        />
                                      );
                                    })}
                                  {!endReached && (
                                    <span
                                      style={{
                                        marginTop: "1rem",
                                        display: "block",
                                      }}
                                    >
                                      <Spinner />
                                    </span>
                                  )}
                                </div>
                              )}
                            </React.Fragment>
                          </div>
                        </section>
                      </div>
                      {/* {concepts && numPages && (numPages > 1) && (
                    <ReactPaginate
                      previousLabel={"< Previous"}
                      nextLabel={"Next >"}
                      breakLabel={"..."}
                      breakClassName={"break-me"}
                      activeClassName={"active"}
                      pageCount={numPages}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={this.handlePageClick}
                      containerClassName={"pagination"}
                    />
                  )} */}
                    </div>
                  </div>
                </div>
              )}
            {!loading && concepts.length === 0 && searchWord && (
              <div>
                <h5 className="secondary-display">
                  {" "}
                  No results in this domain that match your search.
                </h5>
                <NoResultSearchComponent
                  domainMatch={this.changeResults}
                  searchValue={searchWord}
                  measurementTestFilter={noMatchFilter}
                  measurementOrderFilter={noMatchFilter}
                />
              </div>
            )}
          </div>
        </React.Fragment>
      );
    }
  }
);
