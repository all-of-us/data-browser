import * as React from "react";

import { genomicsApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { SVVariant, SVVariantInfo } from "publicGenerated";

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
    grid-template-columns: 10rem 7rem 11rem 8rem 5rem 7rem 7rem 8rem 9rem 6rem;
    align-items: center;
    width: 78rem;
    background: white;
    font-size: .8em;
    border-bottom: 1px solid #CCCCCC;
    position: relative;
}

@media (max-width: 900px) {
    .row-layout {
        grid-template-columns: 10rem 7rem 11rem 8rem 5rem 7rem 7rem 8rem 9rem 6rem;
        width: 78rem;
    }
}

`;

interface Props {
  variant: SVVariant;
  allowParentScroll: Function;
}

interface State {
  svVariantExpanded: boolean;
  mouseOverExpanded: boolean;
  variantDetails: SVVariantInfo;
  loadingVarDetails: boolean;
}

export class SVVariantRowComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      svVariantExpanded: false,
      mouseOverExpanded: false,
      variantDetails: null,
      loadingVarDetails: true,
    };
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
  }

  replaceTag(variantType: string) {
    return variantType.replace(/^<|>$/g, '');
  }

  handleClick(variantId?: string) {
    if (variantId) {
      this.getVariantDetails(variantId);
    }
    this.setState({
      svVariantExpanded: !this.state.svVariantExpanded,
    });
    {
    }
  }

  render() {
    const { variant } = this.props;
    const { svVariantExpanded, variantDetails, loadingVarDetails } = this.state;
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
                    onClick={(e) => {}}
                    size="lg"
                    shape="caret"
                    dir="down"
                  />
                </div>
              </div>
            </div>
            <div style={styles.rowItem}>{this.replaceTag(variant.variantType)}</div>
            <div style={styles.rowItem}>
              {variant.consequence ? variant.consequence.toLowerCase() : variant.consequence}
            </div>
            <div style={styles.rowItem}>
              {variant.position ? `chr${variant.position.replace(/-chr/, ', chr')}` : "-"}
            </div>
            <div style={styles.rowItem}>
              {(variant.variantType?.includes('CTX') || variant.variantType?.includes('BND'))
                ? 'N/A' : (variant.size != null && variant.size >= 0 ? variant.size : '-')}
            </div>
            <div style={styles.rowItem}>{variant.alleleCount}</div>
            <div style={styles.rowItem}>{variant.alleleNumber}</div>
            <div style={styles.rowItem}>{variant.alleleFrequency}</div>
            <div style={styles.rowItem}>{variant.homozygoteCount}</div>
            <div style={{...styles.rowItem, ...styles.last}}>{variant.filter ?? '-'}</div>
          </div>
        )}
      </React.Fragment>
    );
  }
}