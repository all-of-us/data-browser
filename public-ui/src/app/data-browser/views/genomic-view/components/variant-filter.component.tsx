import * as React from "react";

import { VariantFilterItemComponent } from "app/data-browser/views/genomic-view/components/variant-filter-item.component";
import { VariantSortItemComponent } from "app/data-browser/views/genomic-view/components/variant-sort-item.component";
import { reactStyles } from "app/utils";
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
  filterItems: {
    maxHeight: "340px",
    overflowY: "auto",
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
      ogFilterMetaData: JSON.parse(
        localStorage.getItem("originalFilterMetadata") || "{}"
      ),
      sortMetadata: this.props.sortMetadata,
    };
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
    const ogFilterMetaData = JSON.parse(
      localStorage.getItem("originalFilterMetadata") || "{}"
    );
    // tslint:disable-next-line: forin
    for (const key in this.state.filteredMetadata) {
      this.state.filteredMetadata[key] = ogFilterMetaData[key];
    }

    const { sortMetadata } = this.state;
    for (const smKey in sortMetadata) {
      sortMetadata[smKey].sortActive = false;
      sortMetadata[smKey].sortDirection = "asc";
    }
    sortMetadata.variantId.sortActive = true;
    sortMetadata.variantId.sortDirection = "asc";

    this.setState(
      {
        cleared: false,
        filteredMetadata: this.state.filteredMetadata,
        sortMetadata: sortMetadata,
      },
      () => this.setState({ cleared: true })
    );
    this.props.onFilterSubmit(this.state.filteredMetadata, sortMetadata);
  }

  render() {
    const { filterMetadata } = this.props;
    const { filterCats, filteredMetadata, cleared, sortMetadata } = this.state;
    return (
      <React.Fragment>
        <div style={styles.filterBox}>
          <div style={styles.filterItems}>
            {filterCats.map((cat, index) => {
              const key = "cat" + index;
              {
                return (
                  cleared &&
                  filterMetadata &&
                  filteredMetadata && (
                    <VariantFilterItemComponent
                      onFilterChange={(e) => this.handleFilterChange(e, cat)}
                      key={key}
                      category={cat}
                      cleared={cleared}
                      filterItem={filteredMetadata[cat.field.toString()]}
                    />
                  )
                );
              }
            })}
            <div style={styles.sortByContainer}>
              {
                <VariantSortItemComponent
                  cleared={cleared}
                  onSortChange={(e) => this.handleSortChange(e)}
                  sortMetadata={sortMetadata}
                />
              }
            </div>
          </div>
          <div style={styles.actionBtnContainer}>
            <button onClick={() => this.handleClear()} style={styles.clearBtn}>
              Clear
            </button>
            <button
              onClick={() => this.submitFilter(filteredMetadata)}
              style={styles.applyBtn}
            >
              Apply
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
