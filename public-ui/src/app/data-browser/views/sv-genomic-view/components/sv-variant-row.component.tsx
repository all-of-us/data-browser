import * as React from "react";

import { genomicsApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { CNCountEntry, SVVariant, SVVariantInfo } from "publicGenerated";

import { SVVariantExpandedComponent } from "./sv-variant-expanded.component";

const styles = reactStyles({
  variant: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    borderRight: "1px solid #CCCCCC",
    boxShadow: "rgb(204 204 204) 0.2rem 0px 8px -2px",
    background: "white",
    color: "#216FB4",
    position: "sticky",
    left: 0,
  },
  caretIcon: {
    fontFamily: "gothamBold,Arial, Helvetica, sans-serif",
    fontWeight: "bold",
  },
  rowItem: {
    width: "100%",
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    paddingLeft: ".75rem",
  },
  // Numeric columns (Size, Allele Count, Allele Number, Allele Frequency,
  // Homozygote Count) are right-aligned so every value -- including the "N/A"
  // and "-" placeholders in Size -- ends at the same edge. paddingRight must
  // stay in sync with headingItemNumeric in sv-variant-table.component.tsx so
  // the header label lines up with the values. tabular-nums gives every digit
  // the same advance width, otherwise the proportional font leaves the digits
  // ragged even with the right edges flush.
  numericRowItem: {
    width: "100%",
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    paddingRight: ".75rem",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  filterItem: {
    width: "100%",
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    paddingLeft: ".75rem",
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
  filterValue: {
    marginBottom: "0.1rem",
    lineHeight: "1.2",
  },
  first: {
    paddingLeft: ".5rem",
  },
  last: {
    paddingRight: ".5rem",
  },
  variantId: {
    wordBreak: "break-all",
    cursor: "pointer",
    display: "inline-flex",
    flexDirection: "row",
  },
  variantIdText: {
    width: "90%",
  },
  variantIconText: {
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    display: "flex",
    alignItems: "center",
  },
  multipleValVariantItem: {
    overflowWrap: "break-word",
    wordBreak: "break-word",
  },
});

// Column widths must stay in sync with .header-layout in
// sv-variant-table.component.tsx. The 9th column (Homozygote Count) is 9rem so
// the header fits on one line.
const css = `
.row-layout {
    display: grid;
    grid-template-columns: 9rem 7rem 9rem 8rem 6rem 7rem 7rem 7rem 9rem 9rem;
    align-items: center;
    width: 78rem;
    background: white;
    font-size: .8em;
    border-bottom: 1px solid #CCCCCC;
    position: relative;
}

@media (max-width: 900px) {
    .row-layout {
        grid-template-columns: 9rem 7rem 9rem 8rem 6rem 7rem 7rem 7rem 9rem 9rem;
        width: 78rem;
    }
}

`;

interface Props {
  variant: SVVariant;
  allowParentScroll: Function;
  resetExpandedSignal?: number;
}

interface State {
  svVariantExpanded: boolean;
  mouseOverExpanded: boolean;
  variantDetails: SVVariantInfo;
  loadingVarDetails: boolean;
  cnCounts: CNCountEntry[];
  cnCountsLoading: boolean;
}

export class SVVariantRowComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      svVariantExpanded: false,
      mouseOverExpanded: false,
      variantDetails: null,
      loadingVarDetails: true,
      cnCounts: [],
      cnCountsLoading: false,
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (
      prevProps.resetExpandedSignal !== this.props.resetExpandedSignal &&
      this.state.svVariantExpanded
    ) {
      this.setState({ svVariantExpanded: false });
    }
  }

  getVariantDetails(variantId: string) {
    genomicsApi()
      .getSVVariantDetails(variantId)
      .then((results: SVVariantInfo) => {
        this.setState({
          variantDetails: results,
          loadingVarDetails: false,
        });
      });

    // Fetch CN counts for CNV variants
    if (this.props.variant.variantType === "<CNV>") {
      this.setState({ cnCountsLoading: true });
      genomicsApi()
        .getSVVariantCNCounts(variantId)
        .then((response) => {
          this.setState({
            cnCounts: response.items || [],
            cnCountsLoading: false,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch CN counts:", err);
          this.setState({ cnCountsLoading: false });
        });
    }
  }

  replaceTag(variantType: string) {
    return variantType.replace(/^<|>$/g, "");
  }

  handleClick(variantId?: string) {
    if (variantId) {
      this.getVariantDetails(variantId);
    }
    this.setState({
      svVariantExpanded: !this.state.svVariantExpanded,
    });
    {
      // intentionally empty
    }
  }

  formatConsequence(consequence: string) {
    return consequence
      ? consequence.toLowerCase().replace(/_/g, " ")
      : consequence;
  }

  // Format integers with thousands separators (1234 -> "1,234").
  formatNumber(val: any): string {
    if (val == null || val === "") {
      return "";
    }
    const n = Number(val);
    if (Number.isNaN(n)) {
      return String(val);
    }
    return n.toLocaleString("en-US");
  }

  // Results-table display only: allele frequency in scientific notation with
  // 2 decimals (0.000036 -> 3.60e-5, 0.001678 -> 1.68e-3). Exact zero shows as
  // "0" rather than "0.00e+0". The variant card keeps the full decimal value.
  formatAlleleFrequency(val: any): string {
    if (val == null || val === "") {
      return "";
    }
    const n = Number(val);
    if (Number.isNaN(n)) {
      return String(val);
    }
    if (n === 0) {
      return "0";
    }
    return n.toExponential(2);
  }

  // Compact size for the results table:
  //   <1,000           -> "266 bp"
  //   1,000..999,999   -> "1.2 kb"   (1 decimal)
  //   >=1,000,000      -> "1.2 Mb"   (1 decimal)
  formatSizeTable(val: any): string {
    if (val == null || val === "") {
      return "";
    }
    const n = Number(val);
    if (Number.isNaN(n)) {
      return String(val);
    }
    if (n < 1000) {
      // Keep integers as-is so we don't see "266.0 bp".
      return `${n} bp`;
    }
    if (n < 1_000_000) {
      return `${(n / 1000).toFixed(1)} kb`;
    }
    return `${(n / 1_000_000).toFixed(1)} Mb`;
  }

  // CTX and BND records describe a junction rather than a span, so they have no
  // meaningful size. Placeholders are plain strings so they right-align in the
  // cell like every other numeric column.
  renderSize(variant: SVVariant) {
    if (
      variant.variantType?.includes("CTX") ||
      variant.variantType?.includes("BND")
    ) {
      return "N/A";
    }
    if (variant.size != null && variant.size >= 0) {
      return this.formatSizeTable(variant.size);
    }
    return "-";
  }

  // Display-only: FILTER values come back underscored (e.g. HIGH_SR_BACKGROUND).
  // Show them with single spaces. The raw value is never mutated — it is what
  // the filter panel submits to the API and what the API matches on.
  formatFilter(filter: string) {
    if (!filter) {
      return "-";
    }
    return filter.split(",").map((item, index) => {
      const trimmedItem = item.trim();
      const formattedLabel = trimmedItem.replace(/_/g, " ");
      return (
        <div key={index} style={styles.filterValue} title={formattedLabel}>
          {formattedLabel}
        </div>
      );
    });
  }

  render() {
    const { variant } = this.props;
    const {
      svVariantExpanded,
      variantDetails,
      loadingVarDetails,
      cnCounts,
      cnCountsLoading,
    } = this.state;
    return (
      <React.Fragment>
        <style>{css}</style>
        {!loadingVarDetails && svVariantExpanded ? (
          <SVVariantExpandedComponent
            loading={loadingVarDetails}
            variant={variant}
            variantDetails={variantDetails}
            closed={() => this.handleClick()}
            hovered={() =>
              this.state.mouseOverExpanded
                ? this.props.allowParentScroll(true)
                : this.props.allowParentScroll(false)
            }
            cnCounts={cnCounts}
            cnCountsLoading={cnCountsLoading}
          />
        ) : (
          <div className="row-layout">
            <div
              onClick={() => this.handleClick(variant.variantId)}
              style={styles.variant}
            >
              <div
                style={{
                  ...styles.first,
                  ...styles.rowItem,
                  ...styles.variantId,
                }}
              >
                <div style={styles.variantIdText}>
                  {variant.variantId.length > 40 ? (
                    <React.Fragment>
                      {variant.variantId.substr(0, 40)} &#8230;
                    </React.Fragment>
                  ) : (
                    variant.variantId
                  )}
                </div>
                <div style={styles.variantIconText}>
                  <ClrIcon
                    style={styles.caretIcon}
                    onClick={(_e) => {}}
                    size="lg"
                    shape="caret"
                    dir="down"
                  />
                </div>
              </div>
            </div>
            <div style={styles.rowItem}>
              {this.replaceTag(variant.variantType)}
            </div>
            <div style={styles.rowItem}>
              {this.formatConsequence(variant.consequence)}
            </div>
            <div style={styles.rowItem}>{variant.position || "-"}</div>
            <div style={styles.numericRowItem}>{this.renderSize(variant)}</div>
            <div style={styles.numericRowItem}>
              {this.formatNumber(variant.alleleCount)}
            </div>
            <div style={styles.numericRowItem}>
              {this.formatNumber(variant.alleleNumber)}
            </div>
            <div style={styles.numericRowItem}>
              {this.formatAlleleFrequency(variant.alleleFrequency)}
            </div>
            <div style={styles.numericRowItem}>
              {this.formatNumber(variant.homozygoteCount)}
            </div>
            <div style={styles.filterItem}>
              {this.formatFilter(variant.filter)}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}