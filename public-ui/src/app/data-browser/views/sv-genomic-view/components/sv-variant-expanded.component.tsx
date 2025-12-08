import * as React from "react";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PopulationChartReactComponent } from "app/data-browser/views/genomic-view/components/population-chart.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { prepVariantPopulationDetails } from "app/utils/constants";
import { Spinner } from "app/utils/spinner";
import { SVVariant, SVVariantInfo } from "publicGenerated";

import { ConsequenceGeneDisplay } from "app/data-browser/views/sv-genomic-view/components/consequence-gene-display-component";

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
.alt-variant-id {
    font-family: gothamBook, Arial, Helvetica, sans-serif;
    font-size: 12px;
    align-items: center;
    margin-bottom: 1rem;
}

.alt-variant-id strong {
    font-family: gothamBold, Arial, Helvetica, sans-serif;
}
.pop-table {
        display: grid;
        grid-template-columns: 20% 20% 20% 20% 20%;
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
        // padding-right: 2rem;
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
    width: "100%",
    background: "#ECF1F4",
    left: "0px",
    padding: ".5em",
    // paddingLeft: "1em",
    zIndex: "9",
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
    textAlign: "center",
  },
  popTableBody: {
    borderBottom: "1px solid #DDE0E4",
    borderLeft: "1px solid #DDE0E4",
    marginBottom: "1rem",
  },
  popTableData: {
    border: "1px solid #DDE0E4",
    borderBottom: "none",
    borderLeft: "none",
    padding: ".5rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  closeIcon: {
    cursor: "pointer",
  },
});

interface Props {
  closed: Function;
  hovered: Function;
  variant: SVVariant;
  variantDetails: SVVariantInfo;
  loading: boolean;
}
// tslint:disable-next-line:no-empty-interface
interface State {
  showAllGenes: boolean;
}

export class SVVariantExpandedComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAllGenes: false
    };
  }
  handleMouseOver = () => {
    this.props.hovered(true);
  };
  replaceTag(variantType: string) {
    return variantType.replace(/^<|>$/g, '');
  }
  render() {
    const { variantDetails, variant, loading } = this.props;
    let variantPopulationDetails: any[] = [];
    // const rsLink =  "https://www.ncbi.nlm.nih.gov/snp/?term=" + variantDetails.rsNumber;
    if (!loading) {
      variantPopulationDetails = prepVariantPopulationDetails(variantDetails);
    }

    const { showAllGenes } = this.state;
    const consequenceString = variantDetails.consequenceGenes || "-";

    // Parse consequence string into a map
    const consequenceMap: Record<string, string[]> = {};
    if (consequenceString !== "-") {
      consequenceString.split(';').forEach(line => {
        const [label, geneStr] = line.split(" - ");
        if (label && geneStr) {
          consequenceMap[label.trim()] = geneStr.split(",").map(g => g.trim());
        }
      });
    }

    const consequenceEntries = Object.entries(consequenceMap);
    const hasMore = consequenceEntries.some(([, genes]) => genes.length > 5);

    return (
      <React.Fragment>
        <style>{css}</style>
        <div onMouseOver={this.handleMouseOver} style={styles.variantExpanded}>
          <div style={{ minWidth: "600px" }}>
            <div style={styles.top}>
              <span style={styles.variantId}>
                <strong style={styles.variantIdLabel}>Variant ID: </strong>{" "}
                {!loading ? (
                  <span
                    style={{ paddingLeft: "1em", overflowWrap: "anywhere" }}
                  >
                    {variant.variantId}
                  </span>
                ) : (
                  <div style={styles.loading}>
                    <Spinner />
                  </div>
                )}{" "}
              </span>
              <div style={{ position: "sticky", right: "2px" }}>
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
                    <span style={styles.catHeading}>Variant Type:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.variantType ? this.replaceTag(variant.variantType) : "-"}
                    </span>
                  </div>
                  <ConsequenceGeneDisplay consequenceString={variantDetails.consequenceGenes || "-"} />

                  <div>
                    <span style={styles.catHeading}>Position:</span>
                    <br />
                    <span style={styles.catInfo}>
                    {variant.position ? `chr${variant.position.replace(/-chr/, ', chr')}` : "-"}
                    </span>
                    </div>
                  <div>
                    <span style={styles.catHeading}>Size:</span>
                    <br />
                    <span style={styles.catInfo}>
                    {(variantDetails.variantType?.includes('CTX') || variantDetails.variantType?.includes('BND'))
                      ? 'N/A'
                      : (variantDetails.size != null && variantDetails.size >= 0 ? variantDetails.size : '-')}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>CPX Type:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.variantType === "<CTX>" || variant.variantType === "<CPX>"
                        ? variantDetails.cpxType || "-"
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>CPX Intervals:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.variantType === "<CTX>" || variant.variantType === "<CPX>"
                        ? variantDetails.cpxIntervals
                          ? variantDetails.cpxIntervals.split(',').map((interval, index) => (
                              <div key={index}>{interval.trim()}</div>
                            ))
                          : "-"
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>Quality Score:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variantDetails.qualityScore? variantDetails.qualityScore : '-'}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>Filter:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variantDetails.filter ? variantDetails.filter : "-"}
                    </span>
                  </div>
                </div>
                <h4 className="pop-title">Genetic Ancestry Populations</h4>
                <div className="pop-table-container">
                  <div style={{ width: "100%" }}>
                    <div className="pop-table">
                      <div style={styles.popTableHeading}></div>
                      <div style={styles.popTableHeading}>
                        <span style={styles.catHeading}>
                          Allele <br />
                          Count
                        </span>
                      </div>
                      <div style={styles.popTableHeading}>
                        <span style={styles.catHeading}>
                          Allele <br />
                          Number
                        </span>
                      </div>
                      <div style={styles.popTableHeading}>
                        <span style={styles.catHeading}>
                          Allele <br />
                          Frequency
                        </span>
                      </div>
                      <div style={styles.popTableHeading}>
                        <span style={styles.catHeading}>
                          Homozygote <br />
                          Count
                        </span>
                      </div>
                    </div>
                    <div style={styles.popTableBody}>
                      {variantPopulationDetails.map((item, index) => {
                        const colorStyle = { color: item.color };
                        return (
                          <div key={index} className="pop-table">
                            <div style={styles.popTableData}>
                              {item.Ancestry !== "Total" ? (
                                <span className="pop-desc">
                                  <FontAwesomeIcon
                                    icon={faCircle}
                                    style={{
                                      ...colorStyle,
                                      marginRight: ".5rem",
                                      transform: "scale(1.3)",
                                    }}
                                  />
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
                <div className="alt-variant-id">
                  <strong>VCF ID:</strong> {variantDetails.variantIDVCF}
                </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
