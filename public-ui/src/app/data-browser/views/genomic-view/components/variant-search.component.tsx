import * as React from "react";

import { environment } from "environments/environment";
import { GeneLeadsIdeogram } from "app/components/GeneLeadsIdeogram";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import { VariantFilterComponent } from "app/data-browser/views/genomic-view/components/variant-filter.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { Spinner } from "app/utils/spinner";
import { GenomicFilters } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";

import { VariantFilterChips } from "./variant-filter-chips.component";

// The search bar accepts several things besides a gene name, each with a
// recognizable shape. Anything matching none of them is treated as a gene.
//   rs number         rs169547
//   genomic region    chr13:32355000-32375000
//   variant ID        13-32355250-T-C
//   position          2-15199481
//   chromosome only   chr1, chrX, 13, MT
const RS_NUMBER = /^rs\d+$/i;
const GENOMIC_REGION = /^(chr)?[\dxymt]+\s*:\s*[\d,]+\s*-\s*[\d,]+$/i;
const VARIANT_ID = /^(chr)?[\dxymt]+-\d+-[acgtn]+-[acgtn]+$/i;
const POSITION = /^(chr)?[\dxymt]+-[\d,]+$/i;

// A bare chromosome, with or without the prefix: 1-22, X, Y, M, MT.
const CHROMOSOME_ONLY = /^(chr)?([1-9]|1\d|2[0-2]|x|y|m|mt)$/i;

// Any term the user has prefixed with "chr" is a coordinate search, no matter how
// incomplete — this also covers half-typed input like "chr1:" arriving mid-debounce.
const CHR_PREFIXED = /^chr/i;

// Gene Leads is only meaningful for a gene-name search. Note the parent derives
// firstGene from the first *result row*, so a region or variant search also
// yields a gene — which is why the section used to appear for those too.
export function isGeneSearch(term: string): boolean {
  if (!term) {
    return false;
  }
  const t = term.trim();
  if (!t) {
    return false;
  }
  return (
    !CHR_PREFIXED.test(t) &&
    !CHROMOSOME_ONLY.test(t) &&
    !RS_NUMBER.test(t) &&
    !GENOMIC_REGION.test(t) &&
    !VARIANT_ID.test(t) &&
    !POSITION.test(t)
  );
}

const styles = reactStyles({
  searchBar: {
    paddingRight: "2rem",
    width: "calc(100% - 16rem)",
    minWidth: "20rem",
  },
  searchHelpText: {
    paddingTop: "2em",
    lineHeight: "1.2em",
    fontSize: "0.75em",
  },
  loading: {
    transform: "scale(.3)",
    marginLeft: "-1rem",
  },
  resultSize: {
    fontSize: "1.2em",
  },
  filterBtn: {
    fontFamily: "gothamBold",
    color: "#216FB4",
    cursor: "pointer",
    width: "fit-content",
    zIndex: 100,
  },
  filterContainer: {
    position: "relative",
    zIndex: 100,
  },
  resultInfo: {
    display: "grid",
    gridTemplateColumns: "11.5rem 1fr",
    alignItems: "baseline",
    zIndex: 100,
  },
  ideogramContainer: {
    width: "100%",
    paddingTop: "1em",
    paddingBottom: "1em",
  },
  // Ideogram.js sets position:relative on its own wrapper, which paints it above
  // unpositioned siblings. Both controls need their own positioned stacking
  // context or the ideogram's overflow box swallows the click.
  ideogramToggle: {
    position: "relative",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: ".25rem",
    fontFamily: "gothamBold, Arial, Helvetica, sans-serif",
    color: "#216FB4",
    cursor: "pointer",
    width: "fit-content",
    fontSize: ".9em",
  },
  ideogramCaretClosed: {
    transform: "rotate(180deg)",
  },
  ideogramCaretOpen: {
    transform: "rotate(0deg)",
  },
  hideBtnContainer: {
    position: "relative",
    zIndex: 100,
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: ".25rem",
  },
  hideBtn: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#216FB4",
    fontFamily: "gothamBold, Arial, Helvetica, sans-serif",
    fontSize: ".9em",
    cursor: "pointer",
  },
});

const css = `
.search-container {
    padding-top: 1em;
    padding-bottom: 1em;
    display: flex;
    flex-wrap:wrap-reverse;
    align-items: flex-end;

}
@media (max-width: 1220px) {
    .search-container {
        // flex-direction: column;
        // align-items: flex-start;
    }
}
`;

export interface Chip {
  cat: any;
  data: GenomicFilters;
}
interface Props {
  onSearchTerm: Function;
  onFilterSubmit: Function;
  searchTerm: string;
  variantListSize: number;
  filterMetadata: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  onSortChange: Function;
  loadingResults: boolean;
  loadingVariantListSize: boolean;
  scrollClean: boolean;
  firstGene?: string;
}
interface State {
  filteredMetadata: GenomicFilters;
  filteredMetaMap: GenomicFilters;
  submittedFilterMetadata: GenomicFilters;
  filterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  filterShow: Boolean;
  searchWord: string;
  scrollClean: boolean;
  currentGene?: string;
  showIdeogram: boolean;
}

export class VariantSearchComponent extends React.Component<Props, State> {
  private filterWrapperRef;
  constructor(props: Props) {
    super(props);
    this.state = {
      searchWord: this.props.searchTerm || "",
      filterShow: false,
      filteredMetadata: undefined,
      filteredMetaMap: undefined,
      filterMetadata: this.props.filterMetadata,
      submittedFilterMetadata: this.props.submittedFilterMetadata,
      sortMetadata: this.props.sortMetadata,
      scrollClean: this.props.scrollClean,
      currentGene: this.props.firstGene || "",
      // Gene Leads starts collapsed — the user opens it from the header.
      showIdeogram: false,
    };
    if (this.state.searchWord !== "") {
      this.props.onSearchTerm(this.state.searchWord);
    }
    this.filterWrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  handleChange(val: string) {
    if (val === "") {
      this.setState({ scrollClean: true });
    }
    this.props.onSearchTerm(val);
    this.setState({
      searchWord: val,
      filteredMetaMap: null,
      filterShow: false,
    });
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const {
      searchTerm,
      filterMetadata,
      submittedFilterMetadata,
      firstGene,
      scrollClean,
    } = this.props;

    if (prevProps.scrollClean !== scrollClean) {
      this.setState({ scrollClean: scrollClean });
    }

    if (prevProps.searchTerm !== searchTerm) {
      this.setState({ searchWord: searchTerm });
    }
    if (prevProps.filterMetadata !== filterMetadata) {
      this.setState({ filterMetadata });
    }
    if (prevProps.submittedFilterMetadata !== submittedFilterMetadata) {
      this.setState({ submittedFilterMetadata });
    }

    if (prevProps.firstGene !== firstGene && firstGene) {
      // New gene — collapse back to the header so the section is closed by
      // default on every search, not just the first one.
      this.setState({ currentGene: firstGene, showIdeogram: false });
    }
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event) {
    const { filterShow } = this.state;
    if (
      this.filterWrapperRef &&
      !this.filterWrapperRef.current.contains(event.target)
    ) {
      if (filterShow) {
        this.setState({ filterShow: !this.state.filterShow });
      }
    }
  }

  toggleIdeogram = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ showIdeogram: !this.state.showIdeogram });
  };

  showFilter() {
    this.setState({ filterShow: !this.state.filterShow });
  }

  handleFilterSubmit(
    filteredMetadata: GenomicFilters,
    sortMetadata: SortMetadata
  ) {
    this.setState({ filteredMetadata: filteredMetadata });
    this.props.onFilterSubmit(filteredMetadata, sortMetadata);
    this.setState({ filterShow: false });
  }

  handleChipChange(changes) {
    // this.setState({ filteredMetaMap: changes });
    const sortMetadata = this.state.sortMetadata;
    this.handleFilterSubmit(changes, sortMetadata);
  }

  handleSortChange(sortChange: any) {
    this.setState({ sortMetadata: sortChange });
    this.props.onSortChange(sortChange);
  }

  render() {
    const {
      searchWord,
      filterShow,
      sortMetadata,
      submittedFilterMetadata,
      scrollClean,
      currentGene,
      showIdeogram,
    } = this.state;
    const { filterMetadata } = this.props;
    const { variantListSize, loadingResults, loadingVariantListSize } =
      this.props;
    const variantListSizeDisplay = variantListSize
      ? variantListSize.toLocaleString()
      : 0;

    const showGeneLeads =
      environment.geneLeads &&
      currentGene &&
      searchWord &&
      isGeneSearch(searchWord);

    return (
      <React.Fragment>
        <style>{css}</style>
        <div className="search-container">
          <div className="search-bar" style={styles.searchBar}>
            <SearchComponent
              value={searchWord}
              searchTitle=""
              domain="genomics"
              onChange={(val: string) => this.handleChange(val)}
              onClear={() => this.handleChange("")}
              placeholderText="Search by gene, variant, rs number, or genomic region"
            />
          </div>
          <div style={styles.searchHelpText}>
            Examples by query type: <br></br>
            <strong>Gene:</strong> BRCA2 <br></br>
            <strong>Variant:</strong> 13-32355250-T-C <br></br>
            <strong>RS Number:</strong> rs169547 <br></br>
            <strong>Genomic Region:</strong> chr13:32355000-32375000
          </div>
        </div>
        {showGeneLeads && (
          <div style={styles.ideogramContainer}>
            <div
              onClick={this.toggleIdeogram}
              style={styles.ideogramToggle}
              role="button"
              tabIndex={0}
              aria-expanded={showIdeogram}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this.toggleIdeogram(e);
                }
              }}
            >
              <span>Gene Ideogram</span>
              <ClrIcon
                style={
                  showIdeogram
                    ? { ...styles.ideogramCaretOpen }
                    : { ...styles.ideogramCaretClosed }
                }
                shape="angle"
              />
            </div>
            {showIdeogram && (
              <React.Fragment>
                <GeneLeadsIdeogram gene={currentGene} />
                <div style={styles.hideBtnContainer}>
                  <button
                    type="button"
                    onClick={this.toggleIdeogram}
                    style={styles.hideBtn}
                  >
                    Hide
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        )}
        {submittedFilterMetadata && (
          <VariantFilterChips
            filteredMetadata={submittedFilterMetadata}
            onChipChange={(changes) => this.handleChipChange(changes)}
          />
        )}
        <div style={styles.resultInfo}>
          {!loadingResults &&
          !loadingVariantListSize &&
          variantListSize > 0 &&
          environment.genoFilters ? (
            <div onClick={() => this.showFilter()} style={styles.filterBtn}>
              <ClrIcon shape="filter-2" /> Filter
            </div>
          ) : scrollClean ? (
            <div> </div>
          ) : (
            <div onClick={() => this.showFilter()} style={styles.filterBtn}>
              <ClrIcon shape="filter-2" /> Filter
            </div>
          )}
          <React.Fragment>
            {!loadingResults && !loadingVariantListSize && searchWord ? (
              <strong style={styles.resultSize}>
                {!loadingResults && !loadingVariantListSize ? (
                  variantListSizeDisplay
                ) : (
                  <span style={styles.loading}>
                    <Spinner />
                  </span>
                )}{" "}
                variants
              </strong>
            ) : scrollClean ? (
              <div> </div>
            ) : (
              <strong style={styles.resultSize}>
                {variantListSizeDisplay} variants
              </strong>
            )}
          </React.Fragment>
        </div>
        {environment.genoFilters && (
          <div style={styles.filterContainer} ref={this.filterWrapperRef}>
            {filterShow && (
              <VariantFilterComponent
                filterMetadata={filterMetadata}
                sortMetadata={sortMetadata}
                onFilterSubmit={(
                  filteredMetadata: GenomicFilters,
                  sortMetadata: SortMetadata
                ) => this.handleFilterSubmit(filteredMetadata, sortMetadata)}
                onSortChange={(e) => this.handleSortChange(e)}
              />
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}