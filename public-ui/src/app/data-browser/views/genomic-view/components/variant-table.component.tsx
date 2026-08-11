import * as React from "react";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { environment } from "environments/environment";
import { reactStyles } from "app/utils";
import { Spinner } from "app/utils/spinner";
import { Variant } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";

import { TablePaginatorComponent } from "./table-paginator.component";
import { VariantRowComponent } from "./variant-row.component";

// Refetches triggered by a filter change are often fast enough that an
// immediately-shown overlay would flash on and straight back off, which reads
// as a glitch rather than as progress. Wait this long before showing it; if the
// results land first the overlay never appears at all.
const LOADING_OVERLAY_DELAY_MS = 200;

const styles = reactStyles({
  tableContainer: {
    borderTop: "1px solid #CCCCCC",
    borderLeft: "1px solid #CCCCCC",
    borderRight: "1px solid #CCCCCC",
    borderBottom: "none",
    borderRadius: "3px 3px 0 0",
    background: "#FAFAFA",
    marginTop: "0.5rem",
    overflowY: environment.infiniteSrcoll ? "scroll" : "hidden",
    height: environment.infiniteSrcoll ? "30rem" : "",
  },
  // The overlay is positioned against this wrapper rather than against
  // .scroll-area, because .scroll-area scrolls — an overlay inside it would
  // drift out of view with the rows.
  tableWrapper: {
    position: "relative",
  },
  // The spinner is anchored near the top of the table rather than centred on
  // it: that's where the eye already is after clicking a filter chip, it stays
  // visible on long result sets where dead-centre falls below the fold, and it
  // sits in the gap under the header instead of on top of a row's text.
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "6rem",
    // Above the sticky header, which sits at z-index 10, and above the rows.
    zIndex: 100,
  },
  noScroll: {
    overflowX: "scroll",
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
    cursor: "pointer",
    position: "relative",
    userSelect: "none",
  },
  // Headers for the right-aligned numeric columns. paddingRight matches
  // numericRowItem in variant-row.component.tsx so the label lines up with the
  // values beneath it. paddingLeft stays at 0 — right-aligned text already
  // pushes away from the left edge, and any left padding narrows the content
  // box enough to wrap the longer labels. The sort arrow trails the label here
  // just as it does on the left-aligned headers, so the arrow always sits on
  // the same side of the text throughout the row.
  headingItemNumeric: {
    fontSize: ".8em",
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    paddingLeft: 0,
    paddingRight: ".75rem",
    cursor: "pointer",
    position: "relative",
    userSelect: "none",
    textAlign: "right",
  },
  headingLabel: {},
  sortIcon: {
    color: "rgb(33, 111, 180)",
    marginLeft: "0.5em",
  },
  first: {
    paddingLeft: ".5rem",
    position: "sticky",
    left: 0,
    background: "#f9f9fa",
    zIndex: 2,
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
    grid-template-columns: 10rem 7rem 7rem 7rem 9rem 7rem 7rem 8rem 10rem;
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
        grid-template-columns: 10rem 7rem 7rem 7rem 9rem 7rem 7rem 8rem 10rem;
        width: 72rem;
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
  onGeneClick: (gene: string) => void;
}

interface State {
  loading: boolean;
  searchResults: Variant[];
  sortMetadata: any;
  allowParentScroll: Boolean;
  resetExpandedSignal: number;
  showLoadingOverlay: boolean;
}

export class VariantTableComponent extends React.Component<Props, State> {
  scrollAreaRef: React.RefObject<HTMLDivElement> = React.createRef();
  observer = null;
  columnNames = [
    "Variant ID",
    "Gene",
    "Consequence",
    "Variant Type",
    "Clinical Significance",
    "Allele Count",
    "Allele Number",
    "Allele Frequency",
    "Homozygote Count",
  ];
  debounceTimer = null;
  overlayTimer = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: props.loadingResults,
      searchResults: props.searchResults,
      sortMetadata: props.sortMetadata,
      allowParentScroll: true,
      resetExpandedSignal: 0,
      showLoadingOverlay: false,
    };
  }

  // True whenever a fetch is in flight, whatever kicked it off — filter change,
  // sort, page change or row-count change.
  isBusy(props: Props, state: State) {
    return state.loading || props.loadingResults || props.loadingVariantListSize;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    const { searchResults, loadingResults, filtered } = this.props;

    if (filtered) {
      this.scrollAreaToTop();
    }
    if (prevProps.searchResults !== searchResults) {
      this.setState({
        searchResults: searchResults,
        loading: loadingResults,
        resetExpandedSignal: this.state.resetExpandedSignal + 1,
      });
    }

    const wasBusy = this.isBusy(prevProps, prevState);
    const isBusy = this.isBusy(this.props, this.state);
    if (isBusy !== wasBusy) {
      clearTimeout(this.overlayTimer);
      if (isBusy) {
        this.overlayTimer = setTimeout(
          () => this.setState({ showLoadingOverlay: true }),
          LOADING_OVERLAY_DELAY_MS
        );
      } else if (this.state.showLoadingOverlay) {
        this.setState({ showLoadingOverlay: false });
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.overlayTimer);
  }

  handleScrollEnd = (_event) => {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const scrollArea = document.querySelector(".scroll-area");
      if (scrollArea) {
        const scrollTop = scrollArea.scrollTop;
        const scrollHeight = scrollArea.scrollHeight;
        const scrolledToBottom = scrollTop / scrollHeight > 0.35;
        if (
          scrolledToBottom &&
          this.props.currentPage <
            this.props.variantListSize / this.props.rowCount
        ) {
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
    // Clone sortMetadata and each inner object so we don't mutate state directly
    const sortMetadata = { ...this.state.sortMetadata };
    Object.keys(sortMetadata).forEach((sKey) => {
      sortMetadata[sKey] = { ...sortMetadata[sKey] };
    });

    if (sortMetadata[key].sortActive) {
      const direction = sortMetadata[key].sortDirection;
      direction === "desc"
        ? (sortMetadata[key].sortDirection = "asc")
        : (sortMetadata[key].sortDirection = "desc");
    } else {
      sortMetadata[key].sortActive = true;
      sortMetadata[key].sortDirection = "desc";
    }

    for (const sKey in sortMetadata) {
      if (sKey !== key) {
        sortMetadata[sKey].sortActive = false;
        sortMetadata[sKey].sortDirection = "desc";
      }
    }

    this.setState(
      {
        sortMetadata: sortMetadata,
        resetExpandedSignal: this.state.resetExpandedSignal + 1,
      },
      () => {
        this.props.onSortClick(this.state.sortMetadata);
      }
    );
  }

  searchItem(searchTerm: string) {
    this.props.onSearchTerm(searchTerm);
  }

  scrollAreaToTop = () => {
    if (this.scrollAreaRef.current) {
      this.scrollAreaRef.current.scrollTop = 0;
    }
  };

  setArrowIcon(varName: string) {
    const { sortMetadata } = this.state;
    return sortMetadata[varName].sortDirection === "asc"
      ? faArrowUp
      : faArrowDown;
  }

  renderColumnHeader = (
    columnKey: string,
    displayName: string,
    additionalStyles = {},
    numeric = false
  ) => {
    const { sortMetadata } = this.state;
    const sortArrow = sortMetadata[columnKey].sortActive && (
      <FontAwesomeIcon
        icon={this.setArrowIcon(columnKey)}
        style={styles.sortIcon}
      />
    );
    return (
      <div
        className="heading-item"
        style={{
          ...(numeric ? styles.headingItemNumeric : styles.headingItem),
          ...additionalStyles,
        }}
        onClick={() => this.sortClick(columnKey)}
        title="Click to sort"
      >
        <span style={styles.headingLabel}>{displayName}</span>
        {sortArrow}
      </div>
    );
  };

  render() {
    const {
      loadingVariantListSize,
      loadingResults,
      variantListSize,
      rowCount,
      currentPage,
    } = this.props;
    const { loading, searchResults, allowParentScroll, showLoadingOverlay } =
      this.state;
    styles.noScroll.overflowX = !allowParentScroll ? "hidden" : "scroll";

    // Once there are results the table stays mounted through refetches, so a
    // filter change dims the existing rows instead of collapsing the table to
    // an empty box. The frame below is only for the very first load.
    const hasResults = searchResults && searchResults.length > 0;

    return (
      <React.Fragment>
        <style>{css}</style>
        {hasResults ? (
          <div style={styles.tableWrapper}>
            <div
              ref={this.scrollAreaRef}
              onScroll={this.handleScrollEnd}
              className="scroll-area"
              style={{ ...styles.tableContainer, ...styles.noScroll }}
            >
              <div className="header-layout">
                {this.renderColumnHeader(
                  "variantId",
                  "Variant ID",
                  styles.first
                )}
                {this.renderColumnHeader("gene", "Gene")}
                {this.renderColumnHeader("consequence", "Consequence")}
                {this.renderColumnHeader("variantType", "Variant Type")}
                {this.renderColumnHeader(
                  "clinicalSignificance",
                  "ClinVar Significance"
                )}
                {this.renderColumnHeader(
                  "alleleCount",
                  "Allele Count",
                  {},
                  true
                )}
                {this.renderColumnHeader(
                  "alleleNumber",
                  "Allele Number",
                  {},
                  true
                )}
                {this.renderColumnHeader(
                  "alleleFrequency",
                  "Allele Frequency",
                  {},
                  true
                )}
                {this.renderColumnHeader(
                  "homozygoteCount",
                  "Homozygote Count",
                  {},
                  true
                )}
              </div>

              {searchResults &&
                searchResults.map((variant, index) => {
                  return (
                    <VariantRowComponent
                      key={index}
                      variant={variant}
                      resetExpandedSignal={this.state.resetExpandedSignal}
                      allowParentScroll={() =>
                        this.setState({
                          allowParentScroll: !this.state.allowParentScroll,
                        })
                      }
                      onGeneClick={this.props.onGeneClick}
                    />
                  );
                })}

              {environment.infiniteSrcoll && (
                <div style={{ marginTop: "2rem" }}>
                  {currentPage < variantListSize / rowCount &&
                    loadingResults && <Spinner />}
                </div>
              )}
            </div>

            {showLoadingOverlay && (
              <div style={styles.loadingOverlay}>
                <Spinner />
              </div>
            )}
          </div>
        ) : (
          <div style={styles.tableFrame}>
            {(loading || loadingVariantListSize || loadingResults) && (
              <div style={styles.center}>
                <Spinner />
              </div>
            )}
        {!loading && !loadingResults && !loadingVariantListSize &&
          (!searchResults ||
          (searchResults && searchResults.length === 0)) && (
              <div style={styles.helpTextContainer}>
                <div style={styles.helpText}>
                  Enter a query in the search bar or get started with an example
                  query:
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
        {hasResults && variantListSize > rowCount && (
          <div className="paginator">
            {!environment.infiniteSrcoll && (
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
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}