import * as React from "react";
import { reactStyles } from "app/utils";
import { Spinner } from "app/utils/spinner";
import { environment } from "environments/environment";
import { SVVariant } from "publicGenerated";
import { SortSVMetadata } from "publicGenerated/fetch";
import { TablePaginatorComponent } from "./table-paginator.component";
import { SVVariantRowComponent } from "./sv-variant-row.component";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

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
  noScroll: {
    overflowX: "scroll"
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
    grid-template-columns: 10rem 7rem 11rem 8rem 5rem 7rem 7rem 8rem 9rem;
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
        grid-template-columns: 10rem 7rem 11rem 8rem 5rem 7rem 7rem 8rem 9rem;
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
  svResults: SVVariant[];
  variantListSize: number;
  loadingVariantListSize: boolean;
  loadingResults: boolean;
  searchTerm: string;
  currentPage: number;
  rowCount: number;
  sortMetadata: SortSVMetadata;
  filtered: boolean;
}

interface State {
  loading: boolean;
  svResults: SVVariant[];
  sortMetadata: any;
  allowParentScroll: Boolean;

}

export class SVVariantTableComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: props.loadingResults,
      svResults: props.svResults,
      sortMetadata: props.sortMetadata,
      allowParentScroll: true
    };
  }
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

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { svResults, loadingResults, filtered } = this.props;

    if (filtered) {
      this.scrollAreaToTop();

    }
    if (prevProps.svResults !== svResults) {
      this.setState({ svResults: svResults, loading: loadingResults });
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

  setArrowIcon(varName: string) {
    const { sortMetadata } = this.state;
    return sortMetadata[varName].sortDirection === "asc" ? faArrowUp : faArrowDown;
  }





  render() {
    const { loadingVariantListSize, loadingResults, variantListSize, rowCount, currentPage } =
      this.props;
    const { loading, svResults, sortMetadata, allowParentScroll } = this.state;
    styles.noScroll.overflowX = !allowParentScroll ? "hidden":"scroll";
    return (
      <React.Fragment>
        <style>{css}</style>
        {!loading &&
          !loadingVariantListSize &&
          svResults &&
          svResults.length ? (
          <div ref={this.scrollAreaRef} onScroll={this.handleScrollEnd} className="scroll-area" style={{...styles.tableContainer, ...styles.noScroll}}>
            <div className="header-layout">
              <div style={{ ...styles.headingItem, ...styles.first }}>
                <span
                  style={styles.headingLabel}>
                  Variant ID
                </span>
                {sortMetadata.variantId.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('variantId')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Variant Type
                </span>
                {sortMetadata.variantType.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('variantType')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Consequence
                </span>
                {sortMetadata.consequence.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('consequence')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Position
                </span>
                {sortMetadata.position.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('position')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Size
                </span>
                {sortMetadata.size.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('size')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Allele Count
                </span>
                {sortMetadata.alleleCount.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('alleleCount')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Allele Number
                </span>
                {sortMetadata.alleleNumber.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('alleleNumber')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={styles.headingItem}>
                <span
                  style={styles.headingLabel}>
                  Allele Frequency
                </span>
                {sortMetadata.alleleFrequency.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('alleleFrequency')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
              <div style={{ ...styles.headingItem, ...styles.last }}>
                <span
                  style={styles.headingLabel}>
                  Homozygote Count
                </span>
                {sortMetadata.homozygoteCount.sortActive && (
                  <FontAwesomeIcon
                    icon={this.setArrowIcon('homozygoteCount')}
                    style={{ color: "rgb(33, 111, 180)", marginLeft: "0.5em" }}
                  />
                )}
              </div>
            </div>

            {svResults &&
              svResults.map((variant, index) => {
                return (
                  <SVVariantRowComponent
                    key={index}
                    variant={variant}
                    allowParentScroll={() => this.setState({allowParentScroll:!this.state.allowParentScroll})}
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
            {(!svResults ||
              (svResults && svResults.length === 0)) && (
                <div style={styles.helpTextContainer}>
                  <div style={styles.helpText}>
                    Enter a query in the search bar or get started with an example query:
                  </div>
                  <div style={styles.helpText}>
                    <strong>Variant:</strong>{" "}
                    <div
                      onClick={() => this.searchItem("1-104946932-0fa1")}
                      style={styles.helpSearchDiv}
                    >
                      1-104946932-0fa1
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
        {!loading &&
          !loadingVariantListSize &&
          svResults &&
          variantListSize > rowCount && (
            <div className="paginator">
              {!environment.infiniteSrcoll &&
                <TablePaginatorComponent
                  pageCount={Math.ceil(variantListSize / rowCount)}
                  variantListSize={variantListSize}
                  currentPage={currentPage}
                  resultsSize={svResults.length}
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