import * as React from "react";

import { PopulationChartReactComponent } from "app/data-browser/views/genomic-view/components/population-chart.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { prepVariantPopulationDetails } from "app/utils/constants";
import { Spinner } from "app/utils/spinner";
import { Variant, VariantInfo } from "publicGenerated";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

const css = `
.exit{
    width:2rem;
    height:2rem;
    color:#216FB4;
}
.pop-table-container {
    display: grid;
    grid-template-columns: 65% 35%;
    text-align: left;
    align-items: center;
    margin-top: 1rem;
}
.pop-title {
    font-weight: bold;
    font-family: gothamBold,Arial, Helvetica, sans-serif;
    font-size: 18px;
    margin-top: 2rem;
}
.pop-table {
        display: grid;
        grid-template-columns: 26% 25% 25% 24%;
        font-size: 14px;
    }
.pop-desc {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.body {
    display: grid;
    grid-template-columns: 26% 25% 25% 24%;
    column-gap: 1rem;
    row-gap: 1rem;
    padding-top: 1rem;
    font-size: 14px;
    width: 100%;
}

@media (max-width: 900px) {
        .pop-table-container{
        display: flex;
        flex-direction: column-reverse;
    }
    .pop-title {
        text-align: center;
    }
    .body{
        grid-template-columns: 33.33% 33.33% 33.33%;
        padding-right: 2rem;
    }
}
}

`;

const styles = reactStyles({
  rsLink: {
    cursor: "pointer",
    color: "rgb(0, 121, 184)",
    textDecoration: "underline",
  },
  variantExpanded: {
    position: "sticky",
    overflowX: "hidden",
    width: "100%",
    minWidth: "550px",
    background: "#ECF1F4",
    left: "0px",
    padding: ".5em",
    paddingLeft: "1em",
    zIndex:"9",
    borderTop: "1px solid rgb(204, 204, 204)",
  },
  top: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #979797",
    width: "100%",
    margin: "0",
    paddingBottom: ".5rem",
  },
  variantId: {
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
  },
  variantIdLabel: {
    width: "fitContent",
    whiteSpace: "nowrap",
  },

  catHeading: {
    fontFamily: "gothamBold,Arial, Helvetica, sans-serif",
  },
  catInfo: {
    overflowWrap: "anywhere",
    height: "1em",
    display: "inline-block",
  },
  totalCatHeading: {
    fontFamily: "gothamBold,Arial, Helvetica, sans-serif",
    marginLeft: "1.6em",
  },
  loading: {
    transform: "scale(.5)",
  },
  popTableContainer: {
    display: "grid",
    gridTemplateColumns: "60% 40%",
    textAlign: "left",
    alignItems: "center",
  },
  // popTable: {
  //     display: 'grid',
  //     gridTemplateColumns: '25% 25% 25% 25%',
  //     fontSize: '14px'
  // },
  popTableHeading: {
    padding: ".5rem",
    paddingBottom: "0",
    paddingTop: "0",
    textAlign: "center"
  },
  popTableBody: {
    borderBottom: "1px solid #DDE0E4",
    borderLeft: "1px solid #DDE0E4",
    marginBottom: "2rem",
  },
  popTableData: {
    border: "1px solid #DDE0E4",
    borderBottom: "none",
    borderLeft: "none",
    padding: ".5rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  closeIcon: {
    cursor: "pointer",
  },
});

interface Props {
  closed: Function;
  variant: Variant;
  variantDetails: VariantInfo;
  loading: boolean;
}
// tslint:disable-next-line:no-empty-interface
interface State {}

export class VariantExpandedComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { variantDetails, variant, loading } = this.props;
    let variantPopulationDetails: any[] = [];
    const rsLink =
      "https://www.ncbi.nlm.nih.gov/snp/?term=" + variantDetails.rsNumber;
    if (!loading) {
      variantPopulationDetails = prepVariantPopulationDetails(variantDetails);
    }
    return (
      <React.Fragment>
        <style>{css}</style>
        <div style={styles.variantExpanded}>
          <div style={styles.top}>
            <span style={styles.variantId}>
              <strong style={styles.variantIdLabel}>Variant ID: </strong>{" "}
              {!loading ? (
                <span style={{ paddingLeft: "1em", overflowWrap: "anywhere" }}>
                  {variant.variantId}
                </span>
              ) : (
                <div style={styles.loading}>
                  <Spinner />
                </div>
              )}{" "}
            </span>
            <div>
              <ClrIcon
                onClick={(e) => this.props.closed()}
                className="exit"
                shape="window-close"
                style={styles.closeIcon}
              />
            </div>
          </div>
          {!loading && (
            <React.Fragment>
              <div className="body">
                <div>
                  <span style={styles.catHeading}>Gene:</span>
                  <br />
                  <span style={styles.catInfo}>{variant.genes ? variant.genes : "-"}</span>
                </div>
                <div>
                  <span style={styles.catHeading}>Consequence:</span>
                  <br />
                  <span style={styles.catInfo}>{variant.consequence ? variant.consequence.replace(/_/g, ' ') : "-"}</span>
                </div>
                <div>
                    <span style={styles.catHeading}>Variant Type:</span>
                    <br />
                    <span style={styles.catInfo}>{variant.variantType ? variant.variantType.replace(/_/g, ' ') : "-"}</span>
                </div>
                <div>
                  <span style={styles.catHeading}>Transcript:</span>
                  <br />
                  <span style={styles.catInfo}>
                    {variantDetails.transcript ? variantDetails.transcript : "-"}
                  </span>
                </div>
                <div>
                  <span style={styles.catHeading}>RS Number:</span>
                  <br />
                  <span style={styles.catInfo}>
                    {variantDetails.rsNumber
                      ? [
                          <a
                            href={rsLink}
                            key={variantDetails.variantId}
                            style={styles.rsLink}
                            target="_blank"
                          >
                            {variantDetails.rsNumber}
                          </a>,
                        ]
                      : "-"}
                  </span>
                </div>
                <div>
                  <span style={styles.catHeading}>DNA Change:</span>
                  <br />
                  <span style={styles.catInfo}>{variantDetails.dnaChange ? variantDetails.dnaChange : "-"}</span>
                </div>
                <div>
                  <span style={styles.catHeading}>Protein Change:</span>
                  <br />
                  <span style={styles.catInfo}>{variant.proteinChange ? variant.proteinChange : "-"}</span>
                </div>
                <div>
                  <span style={styles.catHeading}>ClinVar Significance:</span>
                  <br />
                  <span style={styles.catInfo}>
                    {variant.clinicalSignificance ? variant.clinicalSignificance.replace(/_/g, ' ') : "-"}
                  </span>
                </div>
              </div>
              <h4 className="pop-title">Genetic Ancestry Populations</h4>
              <div className="pop-table-container">
                <div style={{ width: "100%" }}>
                  <div className="pop-table">
                    <div style={styles.popTableHeading}></div>
                    <div style={styles.popTableHeading}>
                      <span style={styles.catHeading}>Allele <br />Count</span>
                    </div>
                    <div style={styles.popTableHeading}>
                      <span style={styles.catHeading}>Allele <br/>Number</span>
                    </div>
                    <div style={styles.popTableHeading}>
                      <span style={styles.catHeading}>Allele <br />Frequency</span>
                    </div>
                    <div style={styles.popTableHeading}>
                      <span style={styles.catHeading}>Homozygote <br />Count</span>
                    </div>
                  </div>
                  <div style={styles.popTableBody}>
                    {variantPopulationDetails.map((item, index) => {
                     console.log(item);
                      const colorStyle = { color: item.color };
                      return (
                        <div key={index} className="pop-table">
                          <div style={styles.popTableData}>
                            {item.Ancestry !== "Total" ? (
                              <span className="pop-desc">
                                <FontAwesomeIcon icon={faCircle}
                                style={{...colorStyle, marginRight: ".5rem", transform: "scale(1.3)",}} />
                                {item.Ancestry}{" "}
                              </span>
                            ) : (
                              <span style={styles.totalCatHeading}>
                                {item.Ancestry}
                              </span>
                            )}{" "}
                          </div>
                          <div style={styles.popTableData}>
                            {item.Ancestry !== "Total" ? (
                              <React.Fragment>
                                {item.AlleleCount.toLocaleString()}
                              </React.Fragment>
                            ) : (
                              <span style={styles.catHeading}>
                                {item.AlleleCount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div style={styles.popTableData}>
                            {item.Ancestry !== "Total" ? (
                              <React.Fragment>
                                {item.AlleleNumber.toLocaleString()}
                              </React.Fragment>
                            ) : (
                              <span style={styles.catHeading}>
                                {item.AlleleNumber.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div style={styles.popTableData}>
                            {item.Ancestry !== "Total" ? (
                              <React.Fragment>
                                {item.AlleleFrequency > 0
                                  ? item.AlleleFrequency.toFixed(6)
                                  : item.AlleleFrequency}
                              </React.Fragment>
                            ) : (
                              <span style={styles.catHeading}>
                                {item.AlleleFrequency > 0
                                  ? item.AlleleFrequency.toFixed(6)
                                  : item.AlleleFrequency}
                              </span>
                            )}
                          </div>
                          <div style={styles.popTableData}>
                            {item.Ancestry !== "Total" ? (
                              <React.Fragment>
                                {item.HomozygoteCount.toLocaleString()}
                              </React.Fragment>
                            ) : (
                              <span style={styles.catHeading}>
                                {item.HomozygoteCount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <PopulationChartReactComponent
                  variantPopulationDetails={variantPopulationDetails}
                />
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}
