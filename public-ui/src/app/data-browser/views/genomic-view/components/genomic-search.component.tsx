import * as React from "react";

import { environment } from "environments/environment";
import { reactStyles } from "app/utils";
import { GenomicFilters, Variant } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";

import { VariantSearchComponent } from "./variant-search.component";
import { VariantTableComponent } from "./variant-table.component";

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
  variantListSize: number;
  loadingVariantListSize: boolean;
  loadingResults: boolean;
  searchResults: Variant[];
  currentPage: number;
  rowCount: number;
  participantCount: string;
  searchTerm: string;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  scrollClean: boolean;
  firstGene?: string;
}

interface State {
  searchTerm: string;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  filtered: boolean;
  firstGene?: string;
}

export class GenomicSearchComponent extends React.Component<Props, State> {
  scrollDiv: any;
  constructor(props: Props) {
    super(props);
    this.scrollDiv = React.createRef();
    this.state = {
      searchTerm: this.props.searchTerm || "",
      filterMetadata: this.props.filterMetadata,
      sortMetadata: this.props.sortMetadata,
      submittedFilterMetadata: this.props.submittedFilterMetadata,
      filtered: false,
      firstGene: this.props.firstGene || "",
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { searchTerm, filterMetadata, submittedFilterMetadata, firstGene } = this.props;
    if (prevProps.searchTerm !== searchTerm) {
      this.setState({ searchTerm: searchTerm });
    }
    if (prevProps.filterMetadata !== filterMetadata) {
      this.setState({ filterMetadata: filterMetadata });
    }
    if (prevProps.submittedFilterMetadata !== submittedFilterMetadata) {
      this.setState({ submittedFilterMetadata: submittedFilterMetadata });
    }
    if (prevProps.firstGene !== firstGene) {
      this.setState({ firstGene: firstGene });
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

  handleGeneClick = (gene: string) => {
    console.log(gene);
    this.setState({ firstGene: gene });
  };

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
      searchResults,
      variantListSize,
      loadingVariantListSize,
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
        <VariantSearchComponent
          onSearchTerm={(searchWord: string) => {
            onSearchInput(searchWord);
            this.setState({ searchTerm: searchWord });
          }}
          onFilterSubmit={(filteredMetadata, sortMetadata) => {
            this.handleFilterSubmit(filteredMetadata, sortMetadata);
          }}
          loadingResults={loadingResults}
          loadingVariantListSize={loadingVariantListSize}
          searchTerm={searchTerm}
          variantListSize={variantListSize}
          filterMetadata={filterMetadata}
          sortMetadata={sortMetadata}
          submittedFilterMetadata={submittedFilterMetadata}
          onSortChange={(e) => this.handleSortClick(e)}
          scrollClean={scrollClean}
          firstGene={this.state.firstGene}
        />
        <VariantTableComponent
          loadingResults={loadingResults}
          loadingVariantListSize={loadingVariantListSize}
          variantListSize={variantListSize}
          searchResults={searchResults}
          searchTerm={searchTerm}
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
          onGeneClick={this.handleGeneClick}
        />
      </React.Fragment>
    );
  }
}
