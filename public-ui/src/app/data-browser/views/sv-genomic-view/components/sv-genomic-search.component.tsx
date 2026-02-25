import * as React from "react";

import { environment } from "environments/environment";
import { SVVariantSearchComponent } from "app/data-browser/views/sv-genomic-view/components/sv-variant-search.component";
import { SVVariantTableComponent } from "app/data-browser/views/sv-genomic-view/components/sv-variant-table.component";
import { reactStyles } from "app/utils";
import { GenomicFilters, SVVariant } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";

const styles = reactStyles({
  border: {
    background: "white",
    padding: "2em",
    paddingTop: "1em",
  },
  titleBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  boxHeading: {
    margin: 0,
    fontFamily: "GothamBook, Arial, sans-serif",
    fontWeight: 100,
    fontStyle: "normal",
    fontSize: ".8em",
    fontStretch: "normal",
    lineHeight: "1.47em",
    letterSpacing: "normal",
    textAlign: "left",
    color: "#262262",
  },
});

interface Props {
  onSearchInput: Function;
  onPageChange: Function;
  onRowCountChange: Function;
  onSortClick: Function;
  onFilterSubmit: Function;
  onScrollBottom: Function;
  svVariantListSize: number;
  loadingSVVariantListSize: boolean;
  loadingResults: boolean;
  svResults: SVVariant[];
  currentPage: number;
  rowCount: number;
  participantCount: string;
  searchTerm: string;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  scrollClean: boolean;
}

interface State {
  searchTerm: string;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  filtered: boolean;
}

export class SVGenomicSearchComponent extends React.Component<Props, State> {
  scrollDiv: any;
  constructor(props: Props) {
    super(props);
    this.scrollDiv = React.createRef();
    this.state = {
      searchTerm: this.props.searchTerm || "", // Set searchTerm from props
      filterMetadata: this.props.filterMetadata,
      sortMetadata: this.props.sortMetadata,
      submittedFilterMetadata: this.props.submittedFilterMetadata,
      filtered: false,
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { searchTerm, filterMetadata, submittedFilterMetadata } = this.props;

    // Update state if searchTerm in props changes
    if (prevProps.searchTerm !== searchTerm) {
      this.setState({ searchTerm: searchTerm });
    }

    // Update state if filterMetadata in props changes
    if (prevProps.filterMetadata !== filterMetadata) {
      this.setState({ filterMetadata: filterMetadata });
    }

    // Update state if submittedFilterMetadata in props changes
    if (prevProps.submittedFilterMetadata !== submittedFilterMetadata) {
      this.setState({ submittedFilterMetadata: submittedFilterMetadata });
    }
  }

  handlePageChange(info) {
    this.props.onPageChange(info);
    {
      !environment.infiniteSrcoll &&
        this.scrollDiv.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  handleRowCountChange(info) {
    this.props.onRowCountChange(info);
    this.scrollDiv.current.scrollIntoView({ behavior: "smooth" });
  }

  handleSortClick(sortMetadata) {
    this.props.onSortClick(sortMetadata);
  }

  handleFilterSubmit(filteredMetadata, sortMetadata) {
    this.props.onFilterSubmit(filteredMetadata, sortMetadata);
    this.setState({ filtered: true });
    setTimeout(() => {
      this.setState({ filtered: false });
    }, 1000);
  }

  handleScrollBottom() {
    this.props.onScrollBottom();
  }

  render() {
    const {
      searchTerm,
      filterMetadata,
      sortMetadata,
      submittedFilterMetadata,
      filtered,
    } = this.state;
    const {
      currentPage,
      loadingResults,
      svResults,
      svVariantListSize,
      loadingSVVariantListSize,
      onSearchInput,
      rowCount,
      scrollClean,
    } = this.props;

    return (
      <React.Fragment>
        <div style={styles.titleBox}>
          <p style={styles.boxHeading} ref={this.scrollDiv}>
            Explore allele frequencies for a gene or genomic region and drill
            down into variants to view select annotations and genetic ancestry
            associations. Variants are based on short-read whole genome
            sequencing and called against the GRCh38/hg38 genome reference.
            Learn more about{" "}
            <a
              style={{ color: "#1f79b8", cursor: "pointer" }}
              target="_blank"
              href="https://support.researchallofus.org/hc/en-us/articles/29475228181908-How-the-All-of-Us-Genomic-data-are-organized/"
            >
              how genomic data are organized.
            </a>
          </p>
        </div>
        <SVVariantSearchComponent
          onSearchTerm={(searchWord: string) => {
            onSearchInput(searchWord);
            this.setState({ searchTerm: searchWord });
          }}
          onFilterSubmit={(filteredMetadata, sortMetadata) => {
            this.handleFilterSubmit(filteredMetadata, sortMetadata);
          }}
          loadingResults={loadingResults}
          loadingSVVariantListSize={loadingSVVariantListSize}
          searchTerm={searchTerm} // Use searchTerm from state
          svVariantListSize={svVariantListSize}
          filterMetadata={filterMetadata}
          sortMetadata={sortMetadata}
          submittedFilterMetadata={submittedFilterMetadata}
          onSortChange={(e) => this.handleSortClick(e)}
          scrollClean={scrollClean}
        />
        <SVVariantTableComponent
          loadingResults={loadingResults}
          loadingSVVariantListSize={loadingSVVariantListSize}
          svVariantListSize={svVariantListSize}
          svResults={svResults}
          searchTerm={searchTerm} // Use searchTerm from state
          onSearchTerm={(searchWord: string) => {
            onSearchInput(searchWord);
            this.setState({ searchTerm: searchWord });
          }}
          onRowCountChange={(info: any) => this.handleRowCountChange(info)}
          onPageChange={(info: any) => this.handlePageChange(info)}
          onSortClick={(sortMetadata: any) =>
            this.handleSortClick(sortMetadata)
          }
          onScrollBottom={() => {
            environment.infiniteSrcoll && this.handleScrollBottom();
          }}
          currentPage={currentPage}
          rowCount={rowCount}
          sortMetadata={sortMetadata}
          filtered={filtered}
        />
      </React.Fragment>
    );
  }
}
