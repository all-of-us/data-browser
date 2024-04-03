import * as React from "react";

import { genomicsApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { Variant, VariantInfo } from "publicGenerated";

import { VariantExpandedComponent } from "./variant-expanded.component";

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

const css = `
.row-layout {
    display: grid;
    grid-template-columns: 10rem 7rem 7rem 7rem 9rem 7rem 7rem 8rem 10rem;
    align-items: center;
    width: 72rem;
    background: white;
    font-size: .8em;
    border-bottom: 1px solid #CCCCCC;
    position: relative;
}

@media (max-width: 900px) {
    .row-layout {
        grid-template-columns: 10rem 7rem 7rem 7rem 9rem 7rem 7rem 8rem 10rem;
        width: 72rem;
    }
}

`;

interface Props {
  variant: Variant;
  allowParentScroll: Function;
}

interface State {
  variantExpanded: boolean;
  mouseOverExpanded: boolean;
  variantDetails: VariantInfo;
  loadingVarDetails: boolean;
}

export class VariantRowComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      variantExpanded: false,
      mouseOverExpanded: false,
      variantDetails: null,
      loadingVarDetails: true,
    };
  }

  getVariantDetails(variantId: string) {
    genomicsApi()
      .getVariantDetails(variantId)
      .then((results: VariantInfo) => {
        this.setState({
          variantDetails: results,
          loadingVarDetails: false,
        });
      });
  }

  handleClick(variantId?: string) {
    if (variantId) {
      this.getVariantDetails(variantId);
    }
    this.setState({
      variantExpanded: !this.state.variantExpanded,
    });
   {}
  }


render() {
  const { variant } = this.props;
  const { variantExpanded, variantDetails, loadingVarDetails } = this.state;
  return (
    <React.Fragment>
      <style>{css}</style>
      {!loadingVarDetails && variantExpanded ? (
        <VariantExpandedComponent
          loading={loadingVarDetails}
          variant={variant}
          variantDetails={variantDetails}
          closed={() => this.handleClick()}
          hovered={() => this.state.mouseOverExpanded ? this.props.allowParentScroll(true): this.props.allowParentScroll(false)}
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
                  onClick={(e) => { }}
                  size="lg"
                  shape="caret"
                  dir="down"
                />
              </div>
            </div>
          </div>
          <div style={styles.rowItem}>
            {variant.genes && variant.genes.length ? (
              <div>{variant.genes}</div>
            ) : (
              <div>-</div>
            )}
          </div>
          <div style={styles.rowItem}>
            <div style={styles.multipleValVariantItem}>
              {variant.consequence && variant.consequence.length ? (
                <span>{variant.consequence.replace(/_/g, " ")}</span>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
          <div style={styles.rowItem}>
            {variant.variantType ? (
              <div style={{ overflowWrap: "anywhere" }}>
                {variant.variantType}
              </div>
            ) : (
              <div>–</div>
            )}
          </div>
          <div style={styles.rowItem}>
            <div style={styles.multipleValVariantItem}>
              {variant.clinicalSignificance &&
                variant.clinicalSignificance.length ? (
                <span>{variant.clinicalSignificance}</span>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
          <div style={styles.rowItem}>{variant.alleleCount.toLocaleString()}</div>
          <div style={styles.rowItem}>{variant.alleleNumber.toLocaleString()}</div>
          <div style={styles.rowItem}>{variant.alleleFrequency}</div>
          <div style={styles.rowItem}>{variant.homozygoteCount.toLocaleString()}</div>
        </div>
      )}
    </React.Fragment>
  );
}
}
