import * as React from "react";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PopulationChartReactComponent } from "app/data-browser/views/genomic-view/components/population-chart.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { prepVariantPopulationDetails } from "app/utils/constants";
import { Spinner } from "app/utils/spinner";
import { Variant, VariantInfo } from "publicGenerated";

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
    zIndex: 10,
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
    boxSizing: "border-box",
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
    marginBottom: "2rem",
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
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "2rem", // equal to the width of the X button
    flexShrink: 0,
  },
  shareTooltip: {
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "auto",
    fontSize: "14px",
    fontFamily: "GothamBook, Arial, sans-serif",
    backgroundColor: "#FFFFFF",
    color: "#302C71",
    textAlign: "left",
    padding: "5px",
    zIndex: 110,
    lineHeight: "normal",
    outline: "2px solid #302C71",
    boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.15)",
    whiteSpace: "nowrap",
  },
  shareButtonContainer: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    width: "2rem",
    height: "2rem",
  },
});

const ShareIcon: React.FC<{ onClick?: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 36 36"
    width="2rem"
    height="2rem"
    fill="none"
    stroke="rgb(0, 121, 184)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    onClick={onClick}
    style={{ cursor: "pointer" }}
  >
    {/* Box/container - with padding to match ClrIcon */}
    <path d="M9 16v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-10" />
    {/* Arrow pointing up */}
    <polyline points="22 12 18 8 14 12" />
    {/* Arrow stem */}
    <line x1="18" y1="8" x2="18" y2="22" />
  </svg>
);

interface Props {
  closed: Function;
  hovered: Function;
  variant: Variant;
  variantDetails: VariantInfo;
  loading: boolean;
}

interface State {
  showShareTooltip: boolean;
}

export class VariantExpandedComponent extends React.Component<Props, State> {
  private tooltipTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      showShareTooltip: false,
    };
  }

  componentWillUnmount() {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
  }

  handleMouseOver = () => {
    this.props.hovered(true);
  };

  handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();

    const { variant } = this.props;
    const shareUrl = `${window.location.origin}/snvsindels/${variant.variantId}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        this.setState({ showShareTooltip: true });

        // Hide tooltip after 2 seconds
        this.tooltipTimeout = setTimeout(() => {
          this.setState({ showShareTooltip: false });
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
      });
  };

  render() {
    const { variantDetails, variant, loading } = this.props;
    const { showShareTooltip } = this.state;
    let variantPopulationDetails: any[] = [];
    const rsLink =
      "https://www.ncbi.nlm.nih.gov/snp/?term=" + variantDetails.rsNumber;
    if (!loading) {
      variantPopulationDetails = prepVariantPopulationDetails(variantDetails);
    }
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
              <div style={styles.headerActions}>
                {/* Share Button */}
                <div style={styles.shareButtonContainer}>
                  <ShareIcon onClick={this.handleShare} />
                  {showShareTooltip && (
                    <div style={styles.shareTooltip}>
                      Link copied to clipboard
                    </div>
                  )}
                </div>
                {/* Close Button */}
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
                    <span style={styles.catInfo}>
                      {variant.genes ? variant.genes : "-"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>Consequence:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.consequence
                        ? variant.consequence.replace(/_/g, " ")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>Variant Type:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.variantType
                        ? variant.variantType.replace(/_/g, " ")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>Transcript:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variantDetails.transcript
                        ? variantDetails.transcript
                        : "-"}
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
                    <span style={styles.catInfo}>
                      {variantDetails.dnaChange
                        ? variantDetails.dnaChange
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>Protein Change:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.proteinChange ? variant.proteinChange : "-"}
                    </span>
                  </div>
                  <div>
                    <span style={styles.catHeading}>ClinVar Significance:</span>
                    <br />
                    <span style={styles.catInfo}>
                      {variant.clinicalSignificance
                        ? variant.clinicalSignificance.replace(/_/g, " ")
                        : "-"}
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
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}