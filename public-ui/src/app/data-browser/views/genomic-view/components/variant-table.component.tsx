import * as React from "react";
import { reactStyles } from "app/utils";
import { Spinner } from "app/utils/spinner";
import { environment } from "environments/environment";
import { Variant } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";
import { TablePaginatorComponent } from "./table-paginator.component";
import { VariantRowComponent } from "./variant-row.component";

const styles = reactStyles({
  tableContainer: {
    borderTop: "1px solid #CCCCCC",
    borderLeft: "1px solid #CCCCCC",
    borderRight: "1px solid #CCCCCC",
    borderBottom: "none",
    borderRadius: "3px 3px 0 0",
    background: "#FAFAFA",
    marginTop: "0.5rem",
    overflowX: "scroll",
    overflowY: environment.infiniteSrcoll ? "scroll" : "hidden",
    height: environment.infiniteSrcoll ? "30rem" : "",
  },
  tableFrame: {
    border: "1px solid #CCCCCC",
    borderRadius: "3px",
    background: "#FAFAFA",
    marginTop: "0.5rem",
    height: "25rem",
  },
  headingItem: {
    fontSize: ".8em",
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    paddingLeft: ".75rem",
  },
  headingLabel: {
    borderBottom: "1px dashed",
  },
  first: {
    paddingLeft: ".5rem",
    position: "sticky",
    left: 0,
    background: "#f9f9fa",
  },
  last: {
    paddingRight: ".5rem",
  },
  center: {
    display: "flex",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  helpTextContainer: {
    display: "flex",
    height: "100%",
    margin: "0 auto",
    width: "70%",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
  },
  helpText: {
    margin: 0,
    fontFamily: "GothamBook, Arial, sans-serif",
    fontWeight: 100,
    fontStyle: "normal",
    fontSize: "1em",
    fontStretch: "normal",
    lineHeight: "1.47em",
    letterSpacing: "normal",
    textAlign: "left",
    color: "#262262",
  },
  helpSearchDiv: {
    display: "inline",
    textDecoration: "underline",
    cursor: "pointer",
  },
});

const css = `
.header-layout {
    display: grid;
    grid-template-columns: 11rem 8rem 11rem 8rem 10rem 8rem 8rem 8rem;
    background: #f9f9fa;
    font-family: gothamBold,Arial, Helvetica,sans-serif;
    width: 72rem;
    position: sticky;
    left: 0;
    top:0;
    z-index:10;
    border-bottom: 1px solid #CCCCCC;
}
@media (max-width: 900px) {
    .header-layout {
        grid-template-columns: 10rem 8rem 11rem 8rem 10rem 8rem 8rem 8rem;
        width: 71rem;
    }
}
    .paginator {
        background: #f9f9fa;
        border-bottom: 1px solid #CCCCCC;
        border-right: 1px solid #CCCCCC;
        border-left: 1px solid #CCCCCC;
        border-top: none;
        border-radius: 0 0 3px 3px;
        display: flex;
        flex-direction: row;
        gap: 2em;
        justify-content: space-between;
    }
    @media (max-width: 600px) {
        .paginator {
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 0;
        }
    }
`;

interface Props {
  onPageChange: Function;
  onSearchTerm: Function;
  onSortClick: Function;
  onRowCountChange: Function;
  onScrollBottom: Function;
  searchResults: Variant[];
  variantListSize: number;
  loadingVariantListSize: boolean;
  loadingResults: boolean;
  searchTerm: string;
  currentPage: number;
  rowCount: number;
  sortMetadata: SortMetadata;
  filtered: boolean;
}

interface State {
  loading: boolean;
  searchResults: Variant[];
  sortMetadata: any;

}

export class VariantTableComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: props.loadingResults,
      searchResults: props.searchResults,
      sortMetadata: props.sortMetadata,
    };
  }
  scrollAreaRef: React.RefObject<HTMLDivElement> = React.createRef();

  observer = null;

  columnNames = [
    "Variant ID",
    "Gene",
    "Consequence",
    "Protein Change",
    "Clinical Significance",
    "Allele Count",
    "Allele Number",
    "Allele Frequency",
  ];
  debounceTimer = null;

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { searchResults, loadingResults, filtered } = this.props;
    // console.log(loadingResults,'loadingResults');

    
    if (filtered) {
      this.scrollAreaToTop();

    }
    if (prevProps.searchResults !== searchResults) {
      this.setState({ searchResults: searchResults, loading: loadingResults });
    }



  }

  handleScrollEnd = (event) => {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const scrollArea = document.querySelector('.scroll-area');
      if (scrollArea) {
        const scrollTop = scrollArea.scrollTop;
        const scrollHeight = scrollArea.scrollHeight;
        // trigger scroll at 35%
        const scrolledToBottom = scrollTop / scrollHeight > .35;
        if (scrolledToBottom && this.props.currentPage < this.props.variantListSize / this.props.rowCount) {
          // Fetch new data and append
          this.props.onScrollBottom();
        }
      }
    }, 150);
  };



  handlePageClick = (data) => {
    const { searchTerm } = this.props;
    this.setState({ loading: true });
    this.props.onPageChange({ selectedPage: data, searchTerm: searchTerm });
  };

  handleRowCountChange = (data) => {
    this.props.onRowCountChange({ rowCount: data });
  };

  sortClick(key: string) {
    const { sortMetadata } = this.state;
    if (sortMetadata[key].sortActive) {
      const direction = sortMetadata[key].sortDirection;
      direction === "desc"
        ? (sortMetadata[key].sortDirection = "asc")
        : (sortMetadata[key].sortDirection = "desc");
    } else {
      sortMetadata[key].sortActive = true;
    }

    for (const sKey in sortMetadata) {
      if (sKey !== key) {
        sortMetadata[sKey].sortActive = false;
        sortMetadata[sKey].sortDirection = "desc";
      }
    }
    this.setState({ sortMetadata: sortMetadata }, () => {
      this.props.onSortClick(this.state.sortMetadata);
    });
  }

  searchItem(searchTerm: string) {
    this.props.onSearchTerm(searchTerm);
  }

  // Function to scroll the div with class 'scroll-area' to the top
  scrollAreaToTop = () => {
    if (this.scrollAreaRef.current) {
      this.scrollAreaRef.current.scrollTop = 0;
    }
  };



  render() {
    const { loadingVariantListSize, loadingResults, variantListSize, rowCount, currentPage } =
      this.props;
    const { loading, searchResults, sortMetadata } = this.state;
    return (
      <React.Fragment>
        <style>{css}</style>
        {!loading &&
          !loadingVariantListSize &&
          searchResults &&
          searchResults.length ? (
          <div ref={this.scrollAreaRef} onScroll={this.handleScrollEnd} className="scroll-area" style={styles.tableContainer}>
            <div className="header-layout">
              <div style={{ ...styles.headingItem, ...styles.first }}>
                <span
                  style={styles.headingLabel}>
                  Variant ID
                </span>
                {sortMetadata.variantId.sortActive && (
                  <React.Fragment>
                    {sortMetadata.variantId.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Gene
                </span>
                {sortMetadata.gene.sortActive && (
                  <React.Fragment>
                    {sortMetadata.gene.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Consequence
                </span>
                {sortMetadata.consequence.sortActive && (
                  <React.Fragment>
                    {sortMetadata.consequence.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Protein Change
                </span>
                {sortMetadata.proteinChange.sortActive && (
                  <React.Fragment>
                    {sortMetadata.proteinChange.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  ClinVar Significance
                </span>
                {sortMetadata.clinicalSignificance.sortActive && (
                  <React.Fragment>
                    {sortMetadata.clinicalSignificance.sortDirection ===
                      "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Allele Count
                </span>
                {sortMetadata.alleleCount.sortActive && (
                  <React.Fragment>
                    {sortMetadata.alleleCount.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em"
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Allele Number
                </span>
                {sortMetadata.alleleNumber.sortActive && (
                  <React.Fragment>
                    {sortMetadata.alleleNumber.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
              <div style={{ ...styles.headingItem, ...styles.last }}>
                <span
                  style={styles.headingLabel}>
                  Allele Frequency
                </span>
                {sortMetadata.alleleFrequency.sortActive && (
                  <React.Fragment>
                    {sortMetadata.alleleFrequency.sortDirection === "asc" ? (
                      <i
                        className="fas fa-arrow-up"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    ) : (
                      <i
                        className="fas fa-arrow-down"
                        style={{
                          color: "rgb(33, 111, 180)",
                          marginLeft: "0.5em",
                        }}></i>
                    )}
                  </React.Fragment>
                )}
              </div>
            </div>

            {searchResults &&
              searchResults.map((variant, index) => {
                return (
                  <VariantRowComponent
                    key={index}
                    variant={variant}
                  />
                );
              })}
            {environment.infiniteSrcoll && <div style={{ marginTop: "2rem" }}>
              {currentPage < variantListSize / rowCount && loadingResults && <Spinner />}
            </div>}
          </div>
        ) : (
          <div style={styles.tableFrame}>
            {(loading || loadingVariantListSize || loadingResults) && (
              <div style={styles.center}>
                <Spinner />{" "}
              </div>
            )}
            {(!searchResults ||
              (searchResults && searchResults.length === 0)) && (
                <div style={styles.helpTextContainer}>
                  <div style={styles.helpText}>
                    Enter a query in the search bar or get started with an example query:
                  </div>
                  <div style={styles.helpText}>
                    <strong>Gene:</strong>{" "}
                    <div
                      onClick={() => this.searchItem("BRCA2")}
                      style={styles.helpSearchDiv}
                    >
                      BRCA2
                    </div>
                  </div>
                  <div style={styles.helpText}>
                    <strong>Variant:</strong>{" "}
                    <div
                      onClick={() => this.searchItem("13-32355250-T-C")}
                      style={styles.helpSearchDiv}
                    >
                      13-32355250-T-C
                    </div>
                  </div>
                  <div style={styles.helpText}>
                    <strong>RS Number:</strong>{" "}
                    <div
                      onClick={() => this.searchItem("rs169547")}
                      style={styles.helpSearchDiv}
                    >
                      rs169547
                    </div>
                  </div>
                  <div style={styles.helpText}>
                    <strong>Genomic region:</strong>{" "}
                    <div
                      onClick={() => this.searchItem("chr13:32355000-32375000")}
                      style={styles.helpSearchDiv}
                    >
                      chr13:32355000-32375000
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
        {!loading &&
          !loadingVariantListSize &&
          searchResults &&
          variantListSize > rowCount && (
            <div className="paginator">
              {!environment.infiniteSrcoll &&
                <TablePaginatorComponent
                  pageCount={Math.ceil(variantListSize / rowCount)}
                  variantListSize={variantListSize}
                  currentPage={currentPage}
                  resultsSize={searchResults.length}
                  rowCount={rowCount}
                  onPageChange={(info) => {
                    this.handlePageClick(info);
                  }}
                  onRowCountChange={(info) => {
                    this.handleRowCountChange(info);
                  }}
                />
              }
            </div>
          )}
      </React.Fragment>
    );
  }
}