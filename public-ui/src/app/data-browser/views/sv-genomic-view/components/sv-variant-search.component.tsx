import * as React from "react";

import { environment } from "environments/environment";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { Spinner } from "app/utils/spinner";
import { SVGenomicFilters } from "publicGenerated";
import { SortSVMetadata } from "publicGenerated/fetch";

import { SVVariantFilterComponent } from "./sv-variant-filter.component";
import { SVVariantFilterChips } from "./sv-variant-filter-chips.component";

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
    cursor: "Pointer",
    width: "fit-content",
  },
  filterContainer: {
    position: "relative",
  },
  resultInfo: {
    display: "grid",
    gridTemplateColumns: "11.5rem 1fr",
    alignItems: "baseline",
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
  data: SVGenomicFilters;
}
interface Props {
  onSearchTerm: Function;
  onFilterSubmit: Function;
  searchTerm: string;
  svVariantListSize: number;
  filterMetadata: SVGenomicFilters;
  submittedFilterMetadata: SVGenomicFilters;
  sortMetadata: SortSVMetadata;
  onSortChange: Function;
  loadingResults: boolean;
  loadingSVVariantListSize: boolean;
  scrollClean: boolean;
}
interface State {
  filteredMetadata: SVGenomicFilters;
  filteredMetaMap: SVGenomicFilters;
  submittedFilterMetadata: SVGenomicFilters;
  filterMetadata: SVGenomicFilters;
  sortMetadata: SortSVMetadata;
  filterShow: Boolean;
  searchWord: string;
  scrollClean: boolean;
}

export class SVVariantSearchComponent extends React.Component<Props, State> {
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
    };
    if (this.state.searchWord !== "") {
      this.props.onSearchTerm(this.state.searchWord);
    }
    this.filterWrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  handleChange(val: string) {
    if (val == "") {
      this.setState({ scrollClean: true });
    }
    this.props.onSearchTerm(val);
    this.setState({
      searchWord: val,
      filteredMetaMap: null,
      filterShow: false,
    });
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

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
      const { searchTerm, filterMetadata, submittedFilterMetadata, scrollClean } = this.props;

      if (prevProps.scrollClean !== scrollClean) {
        this.setState({ scrollClean: scrollClean });
      }

      if (prevProps.searchTerm !== searchTerm) {
        this.setState({ searchWord: searchTerm });
      }
      if (prevProps.filterMetadata !== filterMetadata) {
        this.setState({ filterMetadata: filterMetadata });
      }
      if (prevProps.submittedFilterMetadata !== submittedFilterMetadata) {
        this.setState({ submittedFilterMetadata: submittedFilterMetadata });
      }
  }

  showFilter() {
    console.log(this.props.submittedFilterMetadata);
    this.setState({ filterShow: !this.state.filterShow });
  }

  handleFilterSubmit(
    filteredMetadata: SVGenomicFilters,
    sortMetadata: SortSVMetadata
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
    } = this.state;
    const { filterMetadata } = this.props;
    const { svVariantListSize, loadingResults, loadingSVVariantListSize } =
      this.props;
    const variantListSizeDisplay = svVariantListSize
      ? svVariantListSize.toLocaleString()
      : 0;
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
              placeholderText="Search by gene, variant, or genomic region"
            />
          </div>
          <div style={styles.searchHelpText}>
            Examples by query type: <br></br>
            <strong>Gene:</strong> AAK1 <br></br>
            <strong>Variant:</strong> 2-15199481 <br></br>
            <strong>Genomic Region:</strong> chr2:15100000-15200000
          </div>
        </div>
        {submittedFilterMetadata && (
          <SVVariantFilterChips
            filteredMetadata={submittedFilterMetadata}
            onChipChange={(changes) => this.handleChipChange(changes)}
          />
        )}
        <div style={styles.resultInfo}>
          {!loadingResults &&
          !loadingSVVariantListSize &&
          svVariantListSize > 0 &&
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
            {!loadingResults && !loadingSVVariantListSize && searchWord ? (
              <strong style={styles.resultSize}>
                {!loadingResults && !loadingSVVariantListSize ? (
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
              <SVVariantFilterComponent
                filterMetadata={filterMetadata}
                sortMetadata={sortMetadata}
                onFilterSubmit={(
                  filteredMetadata: SVGenomicFilters,
                  sortMetadata: SortSVMetadata
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
