import * as React from "react";

import { VariantFilterItemComponent } from "app/data-browser/views/genomic-view/components/variant-filter-item.component";
import { reactStyles } from "app/utils";
import { Spinner } from "app/utils/spinner";
import { GenomicFilters } from "publicGenerated";
import { SortMetadata } from "publicGenerated/fetch";

const styles = reactStyles({
  filterBox: {
    top: ".5rem",
    position: "absolute",
    padding: ".25rem",
    zIndex: 12,
    borderRadius: "0 1px 1px 0",
    backgroundColor: "#FFFFFF",
    boxShadow:
      "0 1px 3px 0 rgba(0,0,0,0.15), 0 0 2px 0 rgba(0,0,0,0.25), 0 2px 2px 0 rgba(0,0,0,0.15)",
    width: "264px",
    height: "421px",
    display: "grid",
    gridTemplateRows: "84% 16%",
  },
  filterItemHandleClosed: {
    transform: "rotate(90deg)",
  },
  sortByContainer: {
    paddingTop: ".5rem",
    paddingRight: ".5rem",
  },
  actionBtnContainer: {
    position: "absolute",
    bottom: ".5rem",
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    fontSize: "1.1em",
  },
  clearBtn: {
    textTransform: "uppercase",
    borderRadius: "2px",
    padding: "1rem",
    border: "none",
    background: "transparent",
    width: "45%",
    cursor: "pointer",
  },
  applyBtn: {
    textTransform: "uppercase",
    borderRadius: "2px",
    padding: "1rem",
    border: "none",
    background: "#262262",
    color: "white",
    width: "45%",
    cursor: "pointer",
  },
  disabledBtn: {
    cursor: "default",
    opacity: 0.5,
  },
  filterItems: {
    maxHeight: "340px",
    overflowY: "auto",
  },
  loadingContainer: {
    display: "flex",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Scale lives on an inner wrapper, not on the flex container above, so the
  // transform can't shift the centering.
  loadingSpinner: {
    transform: "scale(.5)",
  },
});

export interface Cat {
  display: String;
  field: String;
}

interface Props {
  filterMetadata: GenomicFilters;
  sortMetadata: SortMetadata;
  onFilterSubmit: Function;
  onSortChange: Function;
}
interface State {
  filterCats: Cat[];
  filteredMetadata: any;
  filterMetadata: any;
  cleared: Boolean;
  ogFilterMetaData: any;
  sortMetadata: SortMetadata;
}

export class VariantFilterComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filterCats: [
        { display: "Gene", field: "gene" },
        { display: "Consequence", field: "consequence" },
        { display: "Variant Type", field: "variantType" },
        { display: "ClinVar Significance", field: "clinicalSignificance" },
        { display: "Allele Count", field: "alleleCount" },
        { display: "Allele Number", field: "alleleNumber" },
        { display: "Allele Frequency", field: "alleleFrequency" },
        { display: "Homozygote Count", field: "homozygoteCount" },
      ],
      filteredMetadata: this.props.filterMetadata,
      filterMetadata: this.props.filterMetadata,
      cleared: true,
      ogFilterMetaData: this.readOriginalFilterMetadata(),
      sortMetadata: this.props.sortMetadata,
    };
  }

  // Filter options are fetched asynchronously and can land *after* the panel is
  // mounted. Without this, the panel keeps the null it snapshotted at construction
  // and shows nothing until the user closes and reopens it.
  componentDidUpdate(prevProps: Readonly<Props>) {
    const { filterMetadata, sortMetadata } = this.props;

    if (prevProps.filterMetadata !== filterMetadata) {
      this.setState({
        filterMetadata: filterMetadata,
        filteredMetadata: filterMetadata,
        // Written to localStorage by the same call that returns filterMetadata,
        // so it is only reliable once that call has resolved.
        ogFilterMetaData: this.readOriginalFilterMetadata(),
      });
    }

    if (prevProps.sortMetadata !== sortMetadata) {
      this.setState({ sortMetadata: sortMetadata });
    }
  }

  readOriginalFilterMetadata() {
    return JSON.parse(localStorage.getItem("originalFilterMetadata") || "{}");
  }

  handleFilterChange(filteredItem: GenomicFilters, cat: Cat) {
    const filterMetadataChange = this.props.filterMetadata;
    filterMetadataChange[cat.field.toString()] = filteredItem;
    this.setState({ filterMetadata: filterMetadataChange });
  }

  handleSortChange(sortedItem: SortMetadata) {
    this.setState({ sortMetadata: sortedItem });
  }

  submitFilter(filteredMetadata: GenomicFilters) {
    // tslint:disable-next-line: forin
    for (const key in filteredMetadata) {
      const filterItem = filteredMetadata[key];
      const touched =
        Array.isArray(filterItem) && filterItem.some((t) => t.checked);
      if (Array.isArray(filterItem)) {
        if (!touched) {
          filteredMetadata[key] = filterItem.forEach((item) => {
            item.checked = true;
          });
          filteredMetadata[key] = filterItem;
        }
      }
    }
    filteredMetadata = this.state.filteredMetadata;
    const sortMetadata = this.state.sortMetadata;
    this.props.onFilterSubmit(filteredMetadata, sortMetadata);
  }

  handleClear() {
    const ogFilterMetaData = this.readOriginalFilterMetadata();
    // tslint:disable-next-line: forin
    for (const key in this.state.filteredMetadata) {
      this.state.filteredMetadata[key] = ogFilterMetaData[key];
    }

    const { sortMetadata } = this.state;
    for (const smKey in sortMetadata) {
      sortMetadata[smKey].sortActive = false;
      sortMetadata[smKey].sortDirection = "desc";
    }
    sortMetadata.variantId.sortActive = true;
    sortMetadata.variantId.sortDirection = "asc";

    this.setState(
      {
        cleared: false,
        filteredMetadata: this.state.filteredMetadata,
        ogFilterMetaData: ogFilterMetaData,
        sortMetadata: sortMetadata,
      },
      () => this.setState({ cleared: true })
    );
    this.props.onFilterSubmit(this.state.filteredMetadata, sortMetadata);
  }

  render() {
    const { filterMetadata } = this.props;
    const { filterCats, filteredMetadata, cleared } = this.state;

    // Options still in flight — the panel was opened before the filter-options
    // call came back.
    const loadingOptions = !filterMetadata || !filteredMetadata;

    return (
      <React.Fragment>
        <div style={styles.filterBox}>
          <div style={styles.filterItems}>
            {loadingOptions ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}>
                  <Spinner />
                </div>
              </div>
            ) : (
              filterCats.map((cat, index) => {
                const key = "cat" + index;
                return (
                  cleared && (
                    <VariantFilterItemComponent
                      onFilterChange={(e) => this.handleFilterChange(e, cat)}
                      key={key}
                      category={cat}
                      cleared={cleared}
                      filterItem={filteredMetadata[cat.field.toString()]}
                    />
                  )
                );
              })
            )}
          </div>
          <div style={styles.actionBtnContainer}>
            <button
              onClick={() => !loadingOptions && this.handleClear()}
              disabled={loadingOptions as boolean}
              style={{
                ...styles.clearBtn,
                ...(loadingOptions ? styles.disabledBtn : {}),
              }}
            >
              Clear
            </button>
            <button
              onClick={() =>
                !loadingOptions && this.submitFilter(filteredMetadata)
              }
              disabled={loadingOptions as boolean}
              style={{
                ...styles.applyBtn,
                ...(loadingOptions ? styles.disabledBtn : {}),
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}