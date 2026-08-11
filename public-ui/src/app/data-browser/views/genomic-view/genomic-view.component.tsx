import * as React from "react";
import _ from "lodash";

import { environment } from "environments/environment";
import { withRouteData } from "app/components/app-router";
import { GenomicOverviewComponent } from "app/data-browser/views/genomic-view/components/genomic-overview.component";
import { SVGenomicSearchComponent } from "app/data-browser/views/sv-genomic-view/components/sv-genomic-search.component";
import { genomicsApi } from "app/services/swagger-fetch-clients";
import { BreadCrumbComponent } from "app/shared/components/breadcrumb/breadcrumb-react.component";
import { reactStyles } from "app/utils";
import { triggerEvent } from "app/utils/google_analytics";
import { navigateByUrl, urlParamsStore } from "app/utils/navigation";
import {
  GenomicFilters,
  SearchSVVariantsRequest,
  SearchVariantsRequest,
  SVGenomicFilters,
  SVVariant,
  Variant,
} from "publicGenerated";
import {
  SortColumnDetails,
  SortMetadata,
  SortSVMetadata,
} from "publicGenerated/fetch";

import { GenomicFaqComponent } from "./components/genomic-faq.component";
import { GenomicSearchComponent } from "./components/genomic-search.component";

const styles = reactStyles({
  title: {
    fontSize: "35px",
    margin: "0",
    fontFamily: "gothamBook",
  },
  pageHeader: {
    paddingTop: "18px",
    paddingBottom: "18px",
    paddingLeft: "18px",
    paddingRight: "18px",
    lineHeight: "1.5",
    fontSize: "16px",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "18px",
  },
  homeButton: {
    fontFamily: "GothamBook, Arial, sans-serif",
    fontSize: "18px",
    color: "#262262",
    border: "1.5px solid #262262",
    borderRadius: "5px",
    background: "transparent",
    padding: "0.1rem 0.4rem",
    cursor: "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  titleContainer: {
    lineHeight: "1em",
    margin: "0px",
    flex: "1",
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
    width: "100%",
    whiteSpace: "nowrap",
  },
  topBarItem: {
    fontSize: "1em",
    width: "100%",
    cursor: "pointer",
    padding: "1em 2em",
    borderBottom: "3px solid #216fb4",
  },
  topBarItemText: {
    width: "75%",
  },
  topBarItemSelected: {
    fontFamily: "GothamBold, Arial, Helvetica, sans-serif",
    fontWeight: "bolder",
    backgroundColor: "white",
    border: "3px solid #216fb4",
    borderBottomColor: "white",
  },
  genomicsDescText: {
    margin: "0",
  },
  desc: {
    color: "#302C71",
    margin: "0",
    fontSize: ".8em",
    background: "white",
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
    position: "relative",
    marginTop: "-2px",
    zIndex: 5,
  },
  faqHeading: {
    fontSize: "0.8em",
    color: "rgb(38, 34, 98)",
    margin: "0px auto",
    display: "flex",
    paddingTop: "1em",
    justifyContent: "flex-start",
    position: "relative",
    zIndex: 150,
  },
  faqLink: {
    color: "#0079b8",
    cursor: "pointer",
    paddingLeft: "0.25em",
  },
});

interface Props {
  routeData: {
    title: string;
    breadcrumb: { value: string };
  };
  selectionId: number;
}

interface State {
  selectionId: number;
  searchResults: Variant[];
  searchSVResults: SVVariant[];
  loadingResults: boolean;
  loadingSVResults: boolean;
  variantListSize: number;
  loadingVariantListSize: boolean;
  svVariantListSize: number;
  loadingSVVariantListSize: boolean;
  searchTerm: string;
  svSearchTerm: string;
  currentPage: number;
  svCurrentPage: number;
  rowCount: number;
  svRowCount: number;
  participantCount: string;
  chartData: any;
  sortMetadata: SortMetadata;
  svSortMetadata: SortSVMetadata;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  filteredMetadata: GenomicFilters;
  svFilterMetadata: SVGenomicFilters;
  submittedSVFilterMetadata: SVGenomicFilters;
  svFilteredMetadata: SVGenomicFilters;
  filterChipsShow: boolean;
  scrollClean: boolean;
  svScrollClean: boolean;
  firstGene: string;
  previousSelectionId: number;
}

class SortMetadataClass implements SortMetadata {
  variantId: any;
  gene: any;
  consequence: any;
  variantType: any;
  clinicalSignificance: any;
  alleleCount: any;
  alleleNumber: any;
  alleleFrequency: any;
  homozygoteCount: any;
  constructor(
    variantId: any,
    gene: any,
    consequence: any,
    variantType: any,
    clinicalSignificance: any,
    alleleCount: any,
    alleleNumber: any,
    alleleFrequency: any,
    homozygoteCount: any
  ) {
    this.variantId = variantId;
    this.gene = gene;
    this.consequence = consequence;
    this.variantType = variantType;
    this.clinicalSignificance = clinicalSignificance;
    this.alleleCount = alleleCount;
    this.alleleNumber = alleleNumber;
    this.alleleFrequency = alleleFrequency;
    this.homozygoteCount = homozygoteCount;
  }
}

class SortSVMetadataClass implements SortSVMetadata {
  variantId: any;
  variantType: any;
  consequence: any;
  position: any;
  size: any;
  alleleCount: any;
  alleleNumber: any;
  alleleFrequency: any;
  homozygoteCount: any;
  filter: any;
  constructor(
    variantId: any,
    variantType: any,
    consequence: any,
    position: any,
    size: any,
    alleleCount: any,
    alleleNumber: any,
    alleleFrequency: any,
    homozygoteCount: any,
    filter: any
  ) {
    this.variantId = variantId;
    this.variantType = variantType;
    this.consequence = consequence;
    this.position = position;
    this.size = size;
    this.alleleCount = alleleCount;
    this.alleleNumber = alleleNumber;
    this.alleleFrequency = alleleFrequency;
    this.homozygoteCount = homozygoteCount;
    this.filter = filter;
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
.top-bar-item-container {
  width: fit-content;
}
#topBar > div:last-child{
  width: 100vw;
}

}
`;

export const GenomicViewComponent = withRouteData(
  class extends React.Component<Props, State> {
    loading: boolean;
    constructor(props: Props) {
      super(props);
      this.componentCleanup = this.componentCleanup.bind(this);
      this.state = {
        selectionId: props.selectionId,
        searchResults: [],
        searchSVResults: [],
        loadingResults: null,
        loadingSVResults: null,
        variantListSize: null,
        loadingVariantListSize: null,
        svVariantListSize: null,
        loadingSVVariantListSize: null,
        searchTerm: "",
        svSearchTerm: "",
        currentPage: null,
        svCurrentPage: null,
        rowCount: 50,
        svRowCount: 50,
        participantCount: null,
        chartData: null,
        filterChipsShow: false,
        filterMetadata: null,
        svFilterMetadata: null,
        filteredMetadata: undefined,
        submittedFilterMetadata: undefined,
        svFilteredMetadata: undefined,
        submittedSVFilterMetadata: undefined,
        scrollClean: true,
        svScrollClean: true,
        sortMetadata: new SortMetadataClass(
          new SortColumnDetailsClass(true, "asc", 1),
          new SortColumnDetailsClass(false, "asc", 2),
          new SortColumnDetailsClass(false, "asc", 3),
          new SortColumnDetailsClass(false, "asc", 4),
          new SortColumnDetailsClass(false, "asc", 5),
          new SortColumnDetailsClass(false, "asc", 6),
          new SortColumnDetailsClass(false, "asc", 7),
          new SortColumnDetailsClass(false, "asc", 8),
          new SortColumnDetailsClass(false, "asc", 9)
        ),
        svSortMetadata: new SortSVMetadataClass(
          new SortColumnDetailsClass(true, "asc", 1),
          new SortColumnDetailsClass(false, "asc", 2),
          new SortColumnDetailsClass(false, "asc", 3),
          new SortColumnDetailsClass(false, "asc", 4),
          new SortColumnDetailsClass(false, "asc", 5),
          new SortColumnDetailsClass(false, "asc", 6),
          new SortColumnDetailsClass(false, "asc", 7),
          new SortColumnDetailsClass(false, "asc", 8),
          new SortColumnDetailsClass(false, "asc", 9),
          new SortColumnDetailsClass(false, "asc", 10)
        ),
        firstGene: "",
        previousSelectionId: 1,
      };
    }

    svVCFBrowserFlag = environment.svVCFBrowser;

    topBarItems = [
      {
        id: 1,
        label: "SNVs/Indels",
      },
      {
        id: 3,
        label: "Participant Demographics",
      },
      ...(this.svVCFBrowserFlag
        ? [
            {
              id: 2,
              label: "Structural Variants",
            },
          ]
        : []),
    ];

    title = "SNVs/Indels";

    search = _.debounce((searchTerm: string) => {
      this.clearSortMetadata();
      this.getVariantSearch(searchTerm);
      this.changeUrl();
    }, 1000);

    svSearch = _.debounce((svSearchTerm: string) => {
      this.clearSVSortMetadata();
      this.getSVVariantSearch(svSearchTerm);
      this.changeSVUrl();
    }, 1000);

    clearSortMetadata() {
      const { sortMetadata } = this.state;
      for (const smKey in sortMetadata) {
        sortMetadata[smKey].sortActive = false;
        sortMetadata[smKey].sortDirection = "asc";
      }
      sortMetadata.variantId.sortActive = true;
      sortMetadata.variantId.sortDirection = "asc";
      this.setState({ sortMetadata: sortMetadata });
    }

    clearSVSortMetadata() {
      const { svSortMetadata } = this.state;
      for (const smKey in svSortMetadata) {
        svSortMetadata[smKey].sortActive = false;
        svSortMetadata[smKey].sortDirection = "asc";
      }
      svSortMetadata.variantId.sortActive = true;
      svSortMetadata.variantId.sortDirection = "asc";
      this.setState({ svSortMetadata: svSortMetadata });
    }

    clearFilterMetadata() {
      this.setState({
        filterMetadata: null,
        submittedFilterMetadata: undefined,
        filteredMetadata: undefined,
      });
      localStorage.removeItem("originalFilterMetadata");
    }

    clearSVFilterMetadata() {
      this.setState({
        svFilterMetadata: null,
        submittedSVFilterMetadata: undefined,
        svFilteredMetadata: undefined,
      });
      localStorage.removeItem("svOriginalFilterMetadata");
    }

    // Builds the SNV/Indel URL for the currently held search term.
    snvUrl() {
      const { searchTerm } = this.state;
      return searchTerm
        ? "/snvsindels/" + encodeURIComponent(searchTerm)
        : "/snvsindels";
    }

    // Builds the SV URL for the currently held search term.
    svUrl() {
      const { svSearchTerm } = this.state;
      return svSearchTerm
        ? "/structural-variants/" + encodeURIComponent(svSearchTerm)
        : "/structural-variants";
    }

    changeUrl() {
      window.history.pushState(null, "Genomic Variants", this.snvUrl());
    }

    changeSVUrl() {
      window.history.pushState(null, "Genomic Variants", this.svUrl());
    }

    handlePopState = () => {
      const currentUrl = window.location.pathname;
      const pathParts = currentUrl.split("/");

      if (currentUrl.includes("structural-variants")) {
        const searchTerm =
          pathParts[pathParts.length - 1] !== "structural-variants"
            ? decodeURIComponent(pathParts[pathParts.length - 1])
            : "";

        // Only re-run the search if the URL points at a different term than the
        // one already loaded — otherwise just switch back to the tab and keep
        // the results, filters, and sort the user already had.
        if (searchTerm === this.state.svSearchTerm) {
          this.setState({ selectionId: 2 });
          return;
        }

        this.clearSVFilterMetadata();
        this.clearSVSortMetadata();

        this.setState(
          {
            selectionId: 2,
            svSearchTerm: searchTerm,
            loadingSVResults: true,
            loadingSVVariantListSize: true,
          },
          () => {
            if (searchTerm) {
              this.getSVVariantSearch(searchTerm);
            }
          }
        );
      } else if (currentUrl.includes("snvsindels")) {
        const searchTerm =
          pathParts[pathParts.length - 1] !== "snvsindels"
            ? decodeURIComponent(pathParts[pathParts.length - 1])
            : "";

        if (searchTerm === this.state.searchTerm) {
          this.setState({ selectionId: 1 });
          return;
        }

        this.clearFilterMetadata();
        this.clearSortMetadata();

        this.setState(
          {
            selectionId: 1,
            searchTerm: searchTerm,
            loadingResults: true,
            loadingVariantListSize: true,
          },
          () => {
            if (searchTerm) {
              this.getVariantSearch(searchTerm);
            }
          }
        );
      } else if (currentUrl.includes("participant-demographics")) {
        this.setState({ selectionId: 3 });
      }
    };

    getSearchSize(searchTerm: string, filtered: boolean) {
      if (!filtered) {
        this.getFilterMetadata(searchTerm);
      }
      // The flag was only ever cleared, never set, so it under-reported an
      // in-flight count request.
      this.setState({ loadingVariantListSize: true });
      const variantSizeRequest = {
        query: searchTerm,
        filterMetadata: this.state.filterMetadata,
      };
      genomicsApi()
        .getVariantSearchResultSize(variantSizeRequest)
        .then((result) => {
          this.setState({
            variantListSize: searchTerm !== "" ? result : 0,
            loadingVariantListSize: false,
          });
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loadingVariantListSize: false });
        });
    }

    getSVSearchSize(searchTerm: string, filtered: boolean) {
      if (!filtered) {
        this.getSVFilterMetadata(searchTerm);
      }
      this.setState({ loadingSVVariantListSize: true });
      const variantSizeRequest = {
        query: searchTerm,
        filterMetadata: this.state.svFilterMetadata,
      };

      genomicsApi()
        .getSVVariantSearchResultSize(variantSizeRequest)
        .then((result) => {
          this.setState({
            svVariantListSize: searchTerm !== "" ? result : 0,
            loadingSVVariantListSize: false,
          });
        })
        .catch((e) => {
          console.log(e, "error");
          this.setState({ loadingSVVariantListSize: false });
        });
    }

    getFilterMetadata(searchTerm: string) {
      genomicsApi()
        .getGenomicFilterOptions(searchTerm)
        .then((result) => {
          result.gene.items.forEach((el) => {
            el.checked = false;
          });
          result.consequence.items.forEach((el) => {
            el.checked = false;
          });
          result.clinicalSignificance.items.forEach((el) => {
            el.checked = false;
          });
          this.setState({
            filterMetadata: result,
            submittedFilterMetadata: { ...result },
          });
          localStorage.setItem(
            "originalFilterMetadata",
            JSON.stringify(result)
          );
        })
        .catch((e) => {
          console.log(e, "error");
        });
    }

    getSVFilterMetadata(searchTerm: string) {
      genomicsApi()
        .getSVGenomicFilterOptions(searchTerm)
        .then((result) => {
          result.gene.items.forEach((el) => {
            el.checked = false;
          });

          // Set default filters for the filter column: PASS and MULTIALLELIC checked by default
          if (result.filter && result.filter.items) {
            result.filter.items.forEach((el) => {
              if (el.option === "PASS" || el.option === "MULTIALLELIC") {
                el.checked = true;
              } else {
                el.checked = false;
              }
            });
            // Set filterActive to true since we have default checked items
            result.filter.filterActive = true;
          }

          this.setState({
            svFilterMetadata: result,
            submittedSVFilterMetadata: { ...result },
          });
          localStorage.setItem(
            "svOriginalFilterMetadata",
            JSON.stringify(result)
          );
        })
        .catch((e) => {
          console.log(e, "error");
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
          { loadingResults: true, currentPage: 1, rowCount: 200 },
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

    getSVVariantSearch(svSearchTerm: string) {
      this.getSVSearchSize(svSearchTerm, false);
      localStorage.setItem("svSearchWord", svSearchTerm);

      if (svSearchTerm !== "") {
        triggerEvent(
          "svGenomicsPageSearch",
          "Search",
          "Search In Genomics Data",
          "Genomic Search",
          svSearchTerm,
          null
        );
        this.setState(
          { loadingSVResults: true, svCurrentPage: 1, svRowCount: 200 },
          () => {
            this.fetchSVVariantData();
          }
        );
      } else {
        this.setState({
          searchSVResults: null,
          loadingSVResults: false,
        });
      }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
      if (prevProps.selectionId !== this.props.selectionId) {
        this.setState({ selectionId: this.props.selectionId });
      }
    }

    componentCleanup() {
      // this will hold the cleanup code
      localStorage.setItem("searchWord", "");
    }

    componentWillUnmount() {
      localStorage.setItem("searchWord", "");
      this.componentCleanup();
      window.removeEventListener("beforeunload", this.componentCleanup);
      window.removeEventListener("popstate", this.handlePopState);
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

    // loadingResults drives the results-table loading overlay, so it has to go
    // true before the refetch starts, not just false when it lands.
    handleSortClick(sortMetadataTemp) {
      this.setState(
        { sortMetadata: sortMetadataTemp, loadingResults: true },
        () => {
          this.fetchVariantData();
        }
      );
    }

    handleSVSortClick(sortMetadataTemp) {
      this.setState(
        { svSortMetadata: sortMetadataTemp, loadingSVResults: true },
        () => {
          this.fetchSVVariantData();
        }
      );
    }

    handleSVPageChange(info) {
      this.setState(
        { loadingSVResults: true, svCurrentPage: info.selectedPage },
        () => {
          this.fetchSVVariantData();
        }
      );
    }

    handleSVRowCountChange(info) {
      this.setState(
        { loadingSVResults: true, svRowCount: +info.rowCount },
        () => {
          this.fetchSVVariantData();
        }
      );
    }

    fetchVariantData() {
      const {
        searchTerm,
        currentPage,
        sortMetadata,
        rowCount,
        filterMetadata,
      } = this.state;

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

          if (results.items.length > 0) {
            const firstWithGene = results.items.find(
              (item) => item.genes && item.genes.trim() !== ""
            );
            const firstGene = firstWithGene?.genes?.split(",")[0]?.trim();
            if (firstGene) {
              this.setState({ firstGene });
            }
          }
        });
    }

    fetchSVVariantData() {
      const {
        svSearchTerm,
        svCurrentPage,
        svSortMetadata,
        svRowCount,
        svFilterMetadata,
      } = this.state;
      const searchRequest: SearchSVVariantsRequest = {
        query: svSearchTerm,
        pageNumber: svCurrentPage,
        rowCount: svRowCount,
        sortMetadata: svSortMetadata,
        filterMetadata: svFilterMetadata,
      };

      genomicsApi()
        .searchSVVariants(searchRequest)
        .then((results) => {
          this.setState({
            searchSVResults: results.items,
            loadingSVResults: false,
          });
        });
    }

    // Filter refetches previously only cleared loadingResults on completion,
    // never set it — so the table never saw a busy state and showed no loading
    // indicator while new results were being generated.
    filterGenomics(
      filteredMetadata: GenomicFilters,
      sortMetadata: SortMetadata
    ) {
      const { searchTerm, rowCount } = this.state;
      this.setState({ loadingResults: true });
      const searchRequest = {
        query: searchTerm,
        pageNumber: 1,
        rowCount: rowCount,
        filterMetadata: filteredMetadata,
        sortMetadata: sortMetadata,
      };

      genomicsApi()
        .searchVariants(searchRequest)
        .then((results) => {
          this.setState({
            searchResults: results.items,
            loadingResults: false,
          });

          if (results.items.length > 0) {
            const firstWithGene = results.items.find(
              (item) => item.genes && item.genes.trim() !== ""
            );
            const firstGene = firstWithGene?.genes?.split(",")[0]?.trim();
            if (firstGene) {
              this.setState({ firstGene });
            }
          }
        });
    }

    filterSVGenomics(
      filteredMetadata: SVGenomicFilters,
      sortMetadata: SortSVMetadata
    ) {
      const { svSearchTerm, svRowCount } = this.state;
      this.setState({ loadingSVResults: true });
      const searchRequest = {
        query: svSearchTerm,
        pageNumber: 1,
        rowCount: svRowCount,
        filterMetadata: filteredMetadata,
        sortMetadata: sortMetadata,
      };

      genomicsApi()
        .searchSVVariants(searchRequest)
        .then((results) => {
          this.setState({
            searchSVResults: results.items,
            svCurrentPage: 1,
            loadingSVResults: false,
          });
        });
    }

    topBarClick(selected: number) {
      // Opening the FAQ — remember where we came from, don't clear search/filters or change URL
      if (selected === 4) {
        this.setState({
          previousSelectionId: this.state.selectionId,
          selectionId: 4,
        });
        return;
      }

      // Each genomic tab keeps its own search term, results, filters, and sort,
      // so switching tabs only swaps the view — nothing is cleared or refetched.
      this.setState(
        {
          selectionId: selected,
        },
        () => {
          if (selected === 2) {
            window.history.pushState({}, "", this.svUrl());
          } else if (selected === 1) {
            window.history.pushState({}, "", this.snvUrl());
          } else if (selected === 3) {
            window.history.pushState({}, "", "/participant-demographics");
          }
        }
      );
    }

    handleFaqClose() {
      this.setState({ selectionId: this.state.previousSelectionId });
    }

    handleSearchTerm(searchTerm: string) {
      if (this.state.searchTerm !== searchTerm) {
        // Clear filter metadata when starting a new search
        this.clearFilterMetadata();
        this.setState(
          {
            filterMetadata: null,
            searchTerm: searchTerm,
            loadingResults: true,
            loadingVariantListSize: true,
          },
          () => this.search(searchTerm)
        );
      }
    }

    handleSVSearchTerm(searchTerm: string) {
      if (this.state.svSearchTerm !== searchTerm) {
        // Clear SV filter metadata when starting a new search
        this.clearSVFilterMetadata();
        this.setState(
          {
            svFilterMetadata: null,
            submittedSVFilterMetadata: undefined,
            svSearchTerm: searchTerm,
            loadingSVResults: true,
            loadingSVVariantListSize: true,
          },
          () => this.svSearch(searchTerm)
        );
      }
    }

    componentDidMount() {
      window.addEventListener("beforeunload", this.componentCleanup);
      window.addEventListener("popstate", this.handlePopState);

      const { search } = urlParamsStore.getValue();
      const currentUrl = window.location.href;

      if (search) {
        if (currentUrl.includes("structural-variants")) {
          this.setState({ svSearchTerm: search }, () => {
            this.getSVVariantSearch(search);
          });
        } else if (currentUrl.includes("snvsindels")) {
          this.setState({ searchTerm: search }, () => {
            this.getVariantSearch(search);
          });
        }
      }
      this.getGenomicParticipantCounts();
      this.getGenomicChartData();
    }

    handleFilterSubmit(
      filteredMetadata: GenomicFilters,
      sortMetadata: SortMetadata
    ) {
      if (filteredMetadata.alleleFrequency.checked) {
        filteredMetadata.alleleFrequency.maxFreq =
          filteredMetadata.alleleFrequency.max;
        filteredMetadata.alleleFrequency.minFreq =
          filteredMetadata.alleleFrequency.min;
      }

      this.setState({ submittedFilterMetadata: { ...filteredMetadata } });
      this.filterGenomics(filteredMetadata, sortMetadata);
      this.getSearchSize(this.state.searchTerm, true);
    }

    handleSVFilterSubmit(
      filteredMetadata: SVGenomicFilters,
      sortMetadata: SortSVMetadata
    ) {
      if (filteredMetadata.alleleFrequency.checked) {
        filteredMetadata.alleleFrequency.maxFreq =
          filteredMetadata.alleleFrequency.max;
        filteredMetadata.alleleFrequency.minFreq =
          filteredMetadata.alleleFrequency.min;
      }

      this.setState({ submittedSVFilterMetadata: { ...filteredMetadata } });
      this.filterSVGenomics(filteredMetadata, sortMetadata);
      this.getSVSearchSize(this.state.svSearchTerm, true);
    }

    handleScrollBottom() {
      this.setState({
        currentPage: this.state.currentPage + 1,
        loadingResults: true,
        scrollClean: false,
      });
      const {
        searchTerm,
        currentPage,
        sortMetadata,
        rowCount,
        filterMetadata,
      } = this.state;
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

          if (results.items.length > 0) {
            const firstWithGene = results.items.find(
              (item) => item.genes && item.genes.trim() !== ""
            );
            const firstGene = firstWithGene?.genes?.split(",")[0]?.trim();
            if (firstGene) {
              this.setState({ firstGene });
            }
          }
        });
    }

    handleSVScrollBottom() {
      this.setState({
        svCurrentPage: this.state.svCurrentPage + 1,
        loadingSVResults: true,
        svScrollClean: false,
      });
      const {
        svSearchTerm,
        svCurrentPage,
        svSortMetadata,
        svRowCount,
        svFilterMetadata,
      } = this.state;
      const searchRequest: SearchVariantsRequest = {
        query: svSearchTerm,
        pageNumber: svCurrentPage,
        rowCount: svRowCount,
        sortMetadata: svSortMetadata,
        filterMetadata: svFilterMetadata,
      };

      genomicsApi()
        .searchSVVariants(searchRequest)
        .then((results) => {
          this.setState({
            searchSVResults: [...this.state.searchSVResults, ...results.items],
            loadingSVResults: false,
          });
        });
    }

    getTitle() {
      return "Genomic Variants";
    }

    render() {
      const {
        currentPage,
        svCurrentPage,
        selectionId,
        loadingVariantListSize,
        variantListSize,
        loadingSVVariantListSize,
        svVariantListSize,
        loadingResults,
        loadingSVResults,
        searchResults,
        searchSVResults,
        participantCount,
        chartData,
        rowCount,
        svRowCount,
        searchTerm,
        svSearchTerm,
        filterMetadata,
        svFilterMetadata,
        sortMetadata,
        svSortMetadata,
        submittedFilterMetadata,
        submittedSVFilterMetadata,
        scrollClean,
        svScrollClean,
      } = this.state;
      this.topBarItems = this.topBarItems.sort((a, b) => a.id - b.id);
      return (
        <React.Fragment>
          <style>{css}</style>
          <div style={styles.pageHeader}>
            <div style={styles.titleRow}>
              <div style={styles.titleContainer}>
                <h1 style={styles.title}>{this.getTitle()}</h1>
              </div>
              <a onClick={() => navigateByUrl("")} style={styles.homeButton}>
                Home
              </a>
            </div>
            <div style={styles.viewLayout}>
              <div style={styles.topBarLayout} id="topBar">
                {this.topBarItems.map((item, index) => {
                  return (
                    <div key={index} className="top-bar-item-container">
                      <div
                        onClick={() => this.topBarClick(item.id)}
                        style={{
                          ...styles.topBarItem,
                          ...(selectionId === item.id
                            ? {
                                ...styles.topBarItemSelected,
                                borderBottom: "none",
                              }
                            : { borderBottom: "3px solid #216fb4" }),
                        }}
                      >
                        <span style={styles.topBarItemText}>{item.label}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="top-bar-item-container">
                  <div style={{ ...styles.topBarItem, cursor: "default" }}>
                    <span style={styles.topBarItemText}>&nbsp;</span>
                  </div>
                </div>
              </div>
            </div>
            {selectionId === 3 && (
              <div style={styles.innerContainer}>
                <p style={styles.desc}>
                  View the self-reported categories, sex, and age of
                  participants whose genomic data are available within the
                  Researcher Workbench.{" "}
                </p>
              </div>
            )}
            <div style={styles.innerContainer} id="childView">
              {selectionId === 3 && chartData && (
                <GenomicOverviewComponent
                  participantCount={participantCount}
                  chartData={chartData}
                />
              )}
              {selectionId === 1 && (
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
                  onFilterSubmit={(
                    filteredMetadata: GenomicFilters,
                    sortMetadata: SortMetadata
                  ) => {
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
                  firstGene={this.state.firstGene}
                />
              )}
              {selectionId === 2 && (
                <SVGenomicSearchComponent
                  onSearchInput={(svSearchWord: string) => {
                    this.handleSVSearchTerm(svSearchWord);
                    this.setState({ svSearchTerm: svSearchWord });
                  }}
                  onPageChange={(info) => {
                    this.handleSVPageChange(info);
                  }}
                  onRowCountChange={(info) => {
                    this.handleSVRowCountChange(info);
                  }}
                  onSortClick={(sortSVMetadata) => {
                    this.handleSVSortClick(sortSVMetadata);
                  }}
                  onFilterSubmit={(
                    filteredMetadata: GenomicFilters,
                    svSortMetadata: SortSVMetadata
                  ) => {
                    this.handleSVFilterSubmit(filteredMetadata, svSortMetadata);
                  }}
                  onScrollBottom={() => this.handleSVScrollBottom()}
                  currentPage={svCurrentPage}
                  rowCount={svRowCount}
                  svVariantListSize={svVariantListSize}
                  loadingSVVariantListSize={loadingSVVariantListSize}
                  loadingResults={loadingSVResults}
                  svResults={searchSVResults}
                  participantCount={participantCount}
                  searchTerm={svSearchTerm}
                  filterMetadata={svFilterMetadata}
                  submittedFilterMetadata={submittedSVFilterMetadata}
                  sortMetadata={svSortMetadata}
                  scrollClean={svScrollClean}
                />
              )}

              {selectionId === 4 && (
                <GenomicFaqComponent closed={() => this.handleFaqClose()} />
              )}
              <div style={styles.faqHeading}>
                <div className="faq-heading-text">
                  Questions about genetic ancestry?
                  <span
                    style={styles.faqLink}
                    onClick={() => this.topBarClick(4)}
                  >
                    Learn More
                  </span>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }
);