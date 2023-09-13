import * as React from "react";
import _ from "lodash";

import { withRouteData } from "app/components/app-router";
import { GenomicOverviewComponent } from "app/data-browser/views/genomic-view/components/genomic-overview.component";
import { genomicsApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { triggerEvent } from "app/utils/google_analytics";
import { urlParamsStore } from "app/utils/navigation";
import {
  GenomicFilters,
  SearchVariantsRequest,
  Variant,
} from "publicGenerated";

import { SortColumnDetails, SortMetadata } from "publicGenerated/fetch";

import { GenomicFaqComponent } from "./components/genomic-faq.component";
import { GenomicSearchComponent } from "./components/genomic-search.component";

const styles = reactStyles({
  title: {
    fontSize: "35px",
    marginBottom: "0",
    fontFamily: "gothamBook",
  },
  pageHeader: {
    paddingTop: "18px",
    paddingBottom: "18px",
    lineHeight: "1.5",
    fontSize: "16px",
  },
  titleContainer: {
    lineHeight: "1em",
    margin: "0px",
    width: "100%",
    display: "block",
  },
  viewLayout: {
    gridTemplateColumns: "185px 85%",
    columnGap: "0.5rem",
    marginTop: "1em",
    maxWidth: "70rem",
  },
  topBarLayout: {
    color: "#0079b8",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #216fb4",
    width: "100%",
  },
  topBarItemContainer: {
    width: "fit-content",
  },
  topBarItem: {
    fontSize: "1em",
    width: "100%",
    cursor: "pointer",
    padding: "1em 2em",
  },
  topBarItemText: {
    width: "75%",
  },
  topBarItemSelected: {
    fontFamily: "GothamBold, Arial, Helvetica, sans-serif",
    fontWeight: "bolder",
    backgroundColor: "rgba(33,111,180,0.15)",
    borderBottom: "3px solid #216fb4",
  },
  genomicsDescText: {
    margin: "0",
  },
  desc: {
    color: "#302C71",
    margin: "0",
    fontSize: ".8em",
  },
  headingLayout: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1em",
    marginTop: "1em",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingLeft: "0.25em",
    paddingRight: "0.25em",
  },
  genomicParticipantCountStyle: {
    fontWeight: "2em",
  },
  innerContainer: {
    background: "white",
    padding: "1em",
  },
  faqHeading: {
    fontSize: "0.8em",
    color: "rgb(38, 34, 98)",
    margin: "0px auto",
    display: "flex",
    paddingTop: "1em",
    justifyContent: "flex-start",
  },
  faqLink: {
    color: "#0079b8",
    cursor: "pointer",
    paddingLeft: "0.25em",
  },
});

interface State {
  selectionId: number;
  searchResults: Variant[];
  loadingResults: boolean;
  variantListSize: number;
  loadingVariantListSize: boolean;
  searchTerm: string;
  currentPage: number;
  rowCount: number;
  participantCount: string;
  chartData: any;
  sortMetadata: SortMetadata;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  filteredMetadata: GenomicFilters;
  filterChipsShow: boolean;
  scrollClean: boolean;
}

class SortMetadataClass implements SortMetadata {
  variantId: any;
  gene: any;
  consequence: any;
  proteinChange: any;
  clinicalSignificance: any;
  alleleCount: any;
  alleleNumber: any;
  alleleFrequency: any;
  constructor(
    variantId: any,
    gene: any,
    consequence: any,
    proteinChange: any,
    clinicalSignificance: any,
    alleleCount: any,
    alleleNumber: any,
    alleleFrequency: any
  ) {
    this.variantId = variantId;
    this.gene = gene;
    this.consequence = consequence;
    this.proteinChange = proteinChange;
    this.clinicalSignificance = clinicalSignificance;
    this.alleleCount = alleleCount;
    this.alleleNumber = alleleNumber;
    this.alleleFrequency = alleleFrequency;
  }
}

class SortColumnDetailsClass implements SortColumnDetails {
  sortActive: boolean;
  sortDirection: string;
  sortOrder: number;
  constructor(sortActive: boolean, sortDirection: string, sortOrder: number) {
    this.sortActive = sortActive;
    this.sortDirection = sortDirection;
    this.sortOrder = sortOrder;
  }
}

const css = `
`;

export const GenomicViewComponent = withRouteData(
  class extends React.Component<{}, State> {
    loading: boolean;
    constructor(props: {}) {
      super(props);
      this.componentCleanup = this.componentCleanup.bind(this);
      this.state = {
        selectionId: 2,
        searchResults: [],
        loadingResults: null,
        variantListSize: null,
        loadingVariantListSize: null,
        searchTerm: " ",
        currentPage: null,
        rowCount: 50,
        participantCount: null,
        chartData: null,
        filterChipsShow: false,
        filterMetadata: null,
        filteredMetadata: undefined,
        submittedFilterMetadata: undefined,
        scrollClean: true,
        sortMetadata: new SortMetadataClass(
          new SortColumnDetailsClass(true, "asc", 1),
          new SortColumnDetailsClass(false, "asc", 2),
          new SortColumnDetailsClass(false, "asc", 3),
          new SortColumnDetailsClass(false, "asc", 4),
          new SortColumnDetailsClass(false, "asc", 5),
          new SortColumnDetailsClass(false, "asc", 6),
          new SortColumnDetailsClass(false, "asc", 7),
          new SortColumnDetailsClass(false, "asc", 8),
        ),
      };
    }

    topBarItems = [
      {
        id: 2,
        label: "Variant Search",
      },
      {
        id: 1,
        label: "Participant Demographics",
      },
    ];
    title = "SNP/Indel Variants";

    search = _.debounce((searchTerm: string) => {
      this.clearSortMetadata();
      this.getVariantSearch(searchTerm);
      this.changeUrl();
    }, 1000);

    clearSortMetadata() {
      const { sortMetadata } = this.state;
      for (const smKey in sortMetadata) {
        sortMetadata[smKey].sortActive = false;
        sortMetadata[smKey].sortDirection = "asc";
      }
      sortMetadata['variantId'].sortActive = true;
      sortMetadata['variantId'].sortDirection = "asc";
      this.setState({ sortMetadata: sortMetadata });
    }

    changeUrl() {
      const { searchTerm } = this.state;
      let url = "variants";
      if (searchTerm) {
        url += "/" + searchTerm;
      }
      window.history.replaceState(null, "Genomic Variants", url);
    }

    getSearchSize(searchTerm: string, filtered: boolean) {
      if (!filtered) {
        this.getFilterMetadata(searchTerm);
      }
      const variantSizeRequest = {
        query: searchTerm,
        filterMetadata: this.state.filterMetadata
      };
      genomicsApi().getVariantSearchResultSize(variantSizeRequest).then(
        result => {
          this.setState({
            variantListSize: searchTerm !== '' ? result : 0,
            loadingVariantListSize: false
          });
        }
      ).catch(e => {
        console.log(e, 'error');
      });
    }

    getFilterMetadata(searchTerm: string) {
      genomicsApi().getGenomicFilterOptions(searchTerm).then(
        result => {
          result.gene.items.forEach(el => { el.checked = false; });
          result.consequence.items.forEach(el => { el.checked = false; });
          result.clinicalSignificance.items.forEach(el => { el.checked = false; });
          this.setState({ filterMetadata: result, submittedFilterMetadata: { ...result } });
          localStorage.setItem("originalFilterMetadata", JSON.stringify(result));
        }
      ).catch(e => {
        console.log(e, 'error');
      });
    }

    getVariantSearch(searchTerm: string) {
      this.getSearchSize(searchTerm, false);
      localStorage.setItem("searchWord", searchTerm);
      if (searchTerm !== "") {
        triggerEvent(
          "genomicsPageSearch",
          "Search",
          "Search In Genomics Data",
          "Genomic Search",
          searchTerm,
          null
        );
        this.setState(
          { loadingResults: true, currentPage: 1, rowCount: 100 },
          () => {
            this.fetchVariantData();
          }
        );
      } else {
        this.setState({
          searchResults: null,
          loadingResults: false,
        });
      }
    }

    componentCleanup() {
      // this will hold the cleanup code
      localStorage.setItem("searchWord", "");
    }

    componentWillUnmount() {
      localStorage.setItem("searchWord", "");
      this.componentCleanup();
      window.removeEventListener("beforeunload", this.componentCleanup); // remove the event handler for normal unmounting
    }

    getGenomicParticipantCounts() {
      genomicsApi()
        .getParticipantCounts()
        .then((results) => {
          results.results.forEach((type) => {
            if (type.stratum4 === null || type.stratum4 === "") {
              this.setState({
                participantCount: type.countValue.toLocaleString(),
              });
            }
          });
        });
    }

    getGenomicChartData() {
      return genomicsApi()
        .getChartData()
        .then((results) => {
          this.setState({ chartData: results.items });
        });
    }

    handlePageChange(info) {
      this.setState(
        { loadingResults: true, currentPage: info.selectedPage },
        () => {
          this.fetchVariantData();
        }
      );
    }

    handleRowCountChange(info) {
      this.setState({ loadingResults: true, rowCount: +info.rowCount }, () => {
        this.fetchVariantData();
      });
    }

    handleSortClick(sortMetadataTemp) {
      this.setState({ sortMetadata: sortMetadataTemp }, () => {
        this.fetchVariantData();
      });
    }

    fetchVariantData() {
      const { searchTerm, currentPage, sortMetadata, rowCount, filterMetadata } = this.state;

      const searchRequest: SearchVariantsRequest = {
        query: searchTerm,
        pageNumber: currentPage,
        rowCount: rowCount,
        sortMetadata: sortMetadata,
        filterMetadata: filterMetadata,
      };

      genomicsApi()
        .searchVariants(searchRequest)
        .then((results) => {
          this.setState({
            searchResults: results.items,
            loadingResults: false,
          });
        });
    }

    filterGenomics(filteredMetadata: GenomicFilters, sortMetadata: SortMetadata) {
      const { searchTerm, currentPage, rowCount } = this.state;
      const searchRequest = {
        query: searchTerm,
        pageNumber: currentPage,
        rowCount: rowCount,
        filterMetadata: filteredMetadata,
        sortMetadata: sortMetadata,
      };

      genomicsApi()
        .searchVariants(searchRequest)
        .then((results) => {
          this.setState({ searchResults: results.items });
        });
    }

    topBarClick(selected: number) {
      this.setState({
        selectionId: selected,
      });
    }

    handleFaqClose() {
      this.setState({ selectionId: 2 });
    }

    handleSearchTerm(searchTerm: string) {
      if (this.state.searchTerm !== searchTerm) {
        this.setState({ filterMetadata: null, searchTerm: searchTerm, loadingResults: true, loadingVariantListSize: true }, () => this.search(searchTerm));
      }
    }

    componentDidMount() {
      window.addEventListener("beforeunload", this.componentCleanup);
      const { search } = urlParamsStore.getValue();
      if (search) {
        this.setState({ searchTerm: search }, () => {
          this.getVariantSearch(search);
        });
      }
      this.getGenomicParticipantCounts();
      this.getGenomicChartData();
    }

    handleFilterSubmit(filteredMetadata: GenomicFilters, sortMetadata: SortMetadata) {
      if (filteredMetadata['alleleFrequency']['checked']) {
        filteredMetadata['alleleFrequency']['maxFreq'] = filteredMetadata['alleleFrequency']['max'];
        filteredMetadata['alleleFrequency']['minFreq'] = filteredMetadata['alleleFrequency']['min'];
      }

      this.setState({ submittedFilterMetadata: { ...filteredMetadata } });
      this.filterGenomics(filteredMetadata, sortMetadata);
      this.getSearchSize(this.state.searchTerm, true);
    }

    handleScrollBottom() {

      this.setState({ currentPage: this.state.currentPage + 1, loadingResults: true, scrollClean: false })
      const { searchTerm, currentPage, sortMetadata, rowCount, filterMetadata } = this.state;

      const searchRequest: SearchVariantsRequest = {
        query: searchTerm,
        pageNumber: currentPage,
        rowCount: rowCount,
        sortMetadata: sortMetadata,
        filterMetadata: filterMetadata,
      };

      genomicsApi()
        .searchVariants(searchRequest)
        .then((results) => {
          this.setState({
            searchResults: [...this.state.searchResults, ...results.items],
            loadingResults: false,
          });
        });
    }

    render() {
      const { currentPage, selectionId, loadingVariantListSize, variantListSize, loadingResults, searchResults,
        participantCount, chartData, rowCount, searchTerm, filterMetadata, sortMetadata, submittedFilterMetadata,
        scrollClean } = this.state;
      return <React.Fragment>
        <style>{css}</style>
        <div style={styles.pageHeader}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>{this.title}</h1>
          </div>
          <div style={styles.viewLayout}>
            <div style={styles.topBarLayout} id='topBar'>
              {this.topBarItems.map((item, index) => {
                return <div key={index} style={styles.topBarItemContainer}>
                  <div onClick={() => this.topBarClick(item.id)}
                    style={{ ...selectionId === item.id && { ...styles.topBarItemSelected }, ...styles.topBarItem }}>
                    <span style={styles.topBarItemText}>
                      {item.label}
                    </span>
                  </div>
                </div>;
              })
              }
            </div>
          </div>
          {selectionId === 1 && (
            <div style={styles.headingLayout}>
              <p style={styles.desc}>View the self-reported race/ethnicity, sex assigned at birth, and
                age of participants whose genomic data are available within the
                Researcher Workbench.{" "}</p>
            </div>
          )}
          <div style={styles.innerContainer} id="childView">
            {selectionId === 1 && (
              <GenomicOverviewComponent
                participantCount={participantCount}
                chartData={chartData}
              />
            )}
            {(selectionId === 2) && (
              <GenomicSearchComponent
                onSearchInput={(searchWord: string) => {
                  this.handleSearchTerm(searchWord);
                  this.setState({ searchTerm: searchWord });
                }}
                onPageChange={(info) => {
                  this.handlePageChange(info);
                }}
                onRowCountChange={(info) => {
                  this.handleRowCountChange(info);
                }}
                onSortClick={(sortMetadata) => {
                  this.handleSortClick(sortMetadata);
                }}
                onFilterSubmit={(filteredMetadata: GenomicFilters, sortMetadata: SortMetadata) => {
                  this.handleFilterSubmit(filteredMetadata, sortMetadata);
                }}
                onScrollBottom={() => this.handleScrollBottom()}
                currentPage={currentPage}
                rowCount={rowCount}
                variantListSize={variantListSize}
                loadingVariantListSize={loadingVariantListSize}
                loadingResults={loadingResults}
                searchResults={searchResults}
                participantCount={participantCount}
                searchTerm={searchTerm}
                filterMetadata={filterMetadata}
                submittedFilterMetadata={submittedFilterMetadata}
                sortMetadata={sortMetadata}
                scrollClean={scrollClean}
              />
            )}

            {selectionId === 3 && (
              <GenomicFaqComponent closed={() => this.handleFaqClose()} />
            )}
            <div style={styles.faqHeading}>
              <div className="faq-heading-text">
                Questions about genomics?
                <span
                  style={styles.faqLink}
                  onClick={() => this.topBarClick(3)}
                >
                  Learn More
                </span>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment >
    }
  }
);
