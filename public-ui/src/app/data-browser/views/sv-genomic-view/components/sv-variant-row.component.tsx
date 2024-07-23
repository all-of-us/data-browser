import * as React from "react";

import { genomicsApi } from "app/services/swagger-fetch-clients";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { SVVariant } from "publicGenerated";


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
  variant: SVVariant;
  allowParentScroll: Function;
}

interface State {
  mouseOverExpanded: boolean;
}

export class SVVariantRowComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mouseOverExpanded: false,
    };
  }

  getVariantDetails(variantId: string) {
  }

  handleClick(variantId?: string) {

  }


render() {
  const { variant } = this.props;
  return (
    <React.Fragment>
      <style>{css}</style>
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
            {variant.variantType}
          </div>
          <div style={styles.rowItem}>
            {variant.consequence}
          </div>
          <div style={styles.rowItem}>
            {variant.position}
          </div>
          <div style={styles.rowItem}>
            {variant.size}
          </div>
          <div style={styles.rowItem}>
            {variant.alleleCount}
          </div>
          <div style={styles.rowItem}>
            {variant.alleleNumber}
          </div>
          <div style={styles.rowItem}>
            {variant.alleleFrequency}
          </div>
          <div style={styles.rowItem}>
           {variant.homozygoteCount}
          </div>
        </div>
    </React.Fragment>
  );
}
}
