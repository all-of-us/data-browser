import * as React from "react";
import { VariantFilterChips } from './variant-filter-chips.component'
import { environment } from "environments/environment";
import { SearchComponent } from "app/data-browser/search/home-search.component";
import { VariantFilterComponent } from "app/data-browser/views/genomic-view/components/variant-filter.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { Spinner } from "app/utils/spinner";
import { GenomicFilters } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";

const styles = reactStyles({
  searchBar: {
    paddingRight: "2rem",
    width: "42em",
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
    fontSize:"1.2em"
  },
  filterBtn: {
    fontFamily: "gothamBold",
    color: "#216FB4",
    cursor: "Pointer",
    width: "fit-content"
  },
  filterContainer: {
    position: "relative",
  },
  resultInfo: {
    display:"grid",
    gridTemplateColumns: "11.5rem 1fr",
    alignItems: "baseline"
  }
});

const css = `
.search-container {
    padding-top: 1em;
    padding-bottom: 1em;
    display: flex;
    align-items: flex-end;
    flex-direction: row;
}
@media (max-width: 1220px) {
    .search-container {
        flex-direction: column;
        align-items: flex-start;
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
}

export class VariantSearchComponent extends React.Component<Props, State> {
  private filterWrapperRef;
  constructor(props: Props) {
    super(props);
    this.state = {
      searchWord: '',
      filterShow: false,
      filteredMetadata: undefined,
      filteredMetaMap: undefined,
      filterMetadata: this.props.filterMetadata,
      submittedFilterMetadata: this.props.submittedFilterMetadata,
      sortMetadata: this.props.sortMetadata,
      scrollClean: this.props.scrollClean
    };
    if (this.state.searchWord !== '') {
      this.props.onSearchTerm(this.state.searchWord);
    }
    this.filterWrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  handleChange(val: string) {
    if (val == '') { this.setState({ scrollClean: true }) }
    this.props.onSearchTerm(val);
    this.setState({ searchWord: val, filteredMetaMap: null, filterShow: false });
  }

  componentWillUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): void {
    if (this.props.scrollClean != nextProps.scrollClean) {
      this.setState({ scrollClean: nextProps.scrollClean })
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
    if (this.filterWrapperRef && !this.filterWrapperRef.current.contains(event.target)) {
      if (filterShow) {
        this.setState({ filterShow: !this.state.filterShow });
      }
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    const { searchTerm, filterMetadata, submittedFilterMetadata } = this.props;

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
    this.setState({ filterShow: !this.state.filterShow });
  }

  handleFilterSubmit(filteredMetadata: GenomicFilters, sortMetadata: SortMetadata) {
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
    const { searchWord, filterShow, sortMetadata, submittedFilterMetadata, scrollClean } = this.state;
    const { filterMetadata } = this.props
    const { variantListSize, loadingResults, loadingVariantListSize } = this.props;
    const variantListSizeDisplay = variantListSize ? variantListSize.toLocaleString() : 0;
    return <React.Fragment>
      <style>{css}</style>
      <div className='search-container'>
        <div style={styles.searchBar}>
          <SearchComponent value={searchWord} searchTitle='' domain='genomics'
            onChange={(val: string) => this.handleChange(val)}
            onClear={() => this.handleChange('')} placeholderText='Search by gene, variant, rs number, or genomic region' />
        </div>
        <div style={styles.searchHelpText}>
          Examples by query type: <br></br>
          <strong>Gene:</strong> BRCA2 <br></br>
          <strong>Variant:</strong> 13-32355250-T-C <br></br>
          <strong>RS Number:</strong> rs169547 <br></br>
          <strong>Genomic Region:</strong> chr13:32355000-32375000
        </div>
      </div>
      {
        submittedFilterMetadata &&
        <VariantFilterChips
          filteredMetadata={submittedFilterMetadata}
          onChipChange={(changes) => this.handleChipChange(changes)} />
      }
      <div style={styles.resultInfo}>
        {((!loadingResults && !loadingVariantListSize) && (variantListSize > 0) && environment.genoFilters) ? <div onClick={() => this.showFilter()}
          style={styles.filterBtn}><ClrIcon shape='filter-2' /> Filter & Sort</div> :
          scrollClean ? <div> </div> : <div onClick={() => this.showFilter()}
            style={styles.filterBtn}><ClrIcon shape='filter-2' /> Filter & Sort</div>}
        <React.Fragment>
          {
            (!loadingResults && !loadingVariantListSize && searchWord) ? <strong style={styles.resultSize} >{(!loadingResults && !loadingVariantListSize) ? variantListSizeDisplay :
              <span style={styles.loading}><Spinner /></span>} variants</strong> :
              scrollClean ? <div> </div> : <strong style={styles.resultSize} >{variantListSizeDisplay} variants</strong>
          }
        </React.Fragment>
      </div>
      {environment.genoFilters && <div style={styles.filterContainer} ref={this.filterWrapperRef}>
        {filterShow &&
          <VariantFilterComponent
            filterMetadata={filterMetadata}
            sortMetadata={sortMetadata}
            onFilterSubmit={(filteredMetadata: GenomicFilters, sortMetadata: SortMetadata) => this.handleFilterSubmit(filteredMetadata, sortMetadata)}
            onSortChange={(e) => this.handleSortChange(e)}
          />}
      </div>
      }

    </React.Fragment>;
  }
}
