import * as React from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { reactStyles } from "app/utils";
import { GenomicFilters } from "publicGenerated";

interface Props {
  filteredMetadata: GenomicFilters;
  onChipChange: Function;
}
interface State {
  chips: Array<any>;
}

const lables = {
  variantType: "Variant Type",
  consequence: "Consequence",
  size: "Size",
  alleleNumber: "Allele Number",
  alleleFrequency: "Allele Frequency",
  alleleCount: "Allele Count",
  homozygoteCount: "Homozygote Count",
  filter: "Filter",
};

const VARIANT_TYPE_GROUPS = ["INS", "DEL"];

const styles = reactStyles({
  chipCat: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    paddingRight: "0.25rem",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    border: "1px #216fb4 solid",
    color: "rgb(33, 111, 180)",
    padding: ".05rem .5rem",
    borderRadius: "15px",
    fontFamily: "GothamBold",
    margin: ".25rem .25rem",
  },
  chipFormat: {
    fontSize: ".8em",
    display: "flex",
    flexWrap: "wrap",
  },
  chipLayout: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

function stripBrackets(raw: string): string {
  if (!raw) {
    return "";
  }
  return raw.replace(/^<|>$/g, "");
}

function groupFor(rawOption: string): string | null {
  const stripped = stripBrackets(rawOption);
  for (const group of VARIANT_TYPE_GROUPS) {
    if (stripped === group || stripped.startsWith(group + ":")) {
      return group;
    }
  }
  return null;
}

function formatChipValue(cat: string, val: number): string {
  if (val == null || Number.isNaN(val)) {
    return "";
  }
  if (cat === "alleleFrequency") {
    const s = Number(val).toFixed(6);
    return s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }
  return Number(val).toLocaleString("en-US");
}

interface VariantTypeChipRow {
  label: string;
  members: any[];
}

// For variantType chips, collapse INS:* and DEL:* into single group chips.
function buildVariantTypeChipRows(checkedItems: any[]): VariantTypeChipRow[] {
  const groupBuckets: Record<string, any[]> = {};
  const standalone: VariantTypeChipRow[] = [];

  for (const item of checkedItems) {
    const g = groupFor(item.option);
    if (g) {
      if (!groupBuckets[g]) {
        groupBuckets[g] = [];
      }
      groupBuckets[g].push(item);
    } else {
      standalone.push({
        label: stripBrackets(item.option),
        members: [item],
      });
    }
  }

  const rows: VariantTypeChipRow[] = [];
  for (const group of VARIANT_TYPE_GROUPS) {
    if (groupBuckets[group] && groupBuckets[group].length > 0) {
      rows.push({ label: group, members: groupBuckets[group] });
    }
  }
  rows.push(...standalone);
  return rows;
}

export class SVVariantFilterChips extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      chips: [],
    };
  }

  formatChips(filteredMetadata): Array<any> {
    const displayArr = [];
    if (!filteredMetadata) {
      return displayArr;
    }
    for (const key in filteredMetadata) {
      if (
        Object.prototype.hasOwnProperty.call(filteredMetadata, key) &&
        filteredMetadata[key] !== undefined
      ) {
        const allChecked =
          Array.isArray(filteredMetadata[key]) &&
          filteredMetadata[key].every((t) => t.checked);
        if (!allChecked) {
          displayArr.push({ cat: key, data: filteredMetadata[key] });
        }
      }
    }
    return displayArr;
  }

  componentDidUpdate(
    prevProps: Readonly<Props>,
    _prevState: Readonly<State>,
    _snapshot?: any
  ): void {
    if (prevProps.filteredMetadata !== this.props.filteredMetadata) {
      if (!this.props.filteredMetadata) {
        this.setState({ chips: [] });
        return;
      }
      const formattedChips = this.formatChips(this.props.filteredMetadata);
      this.setState({ chips: formattedChips });
    }
  }

  // For group chips (INS / DEL): uncheck every member at once.
  removeVariantTypeGroup(members: any[]) {
    const { filteredMetadata } = this.props;
    if (!filteredMetadata) {
      return;
    }
    const vt = filteredMetadata["variantType"];
    if (!vt || !vt.items) {
      return;
    }
    const memberSet = new Set(members);
    vt.items = vt.items.map((el) =>
      memberSet.has(el) ? { ...el, checked: false } : el
    );
    const anyChecked = vt.items.some((t) => t.checked === true);
    if (!anyChecked && vt.hasOwnProperty("filterActive")) {
      vt.filterActive = false;
    }
    this.props.onChipChange(filteredMetadata);
  }

  removeChip(item, cat) {
    const { filteredMetadata } = this.props;
    if (!filteredMetadata) {
      return;
    }

    if (filteredMetadata[cat.toString()].hasOwnProperty("filterActive")) {
      filteredMetadata[cat.toString()].items = filteredMetadata[
        cat.toString()
      ].items.filter((el) => {
        if (item === el) {
          item.checked = false;
        }
        return el;
      });
    } else {
      filteredMetadata[cat.toString()].checked = false;
      try {
        const originalFilterMetadata = JSON.parse(
          localStorage.getItem("svOriginalFilterMetadata") || "{}"
        );
        if (originalFilterMetadata[cat.toString()]) {
          filteredMetadata[cat.toString()].min =
            originalFilterMetadata[cat.toString()].min;
          filteredMetadata[cat.toString()].max =
            originalFilterMetadata[cat.toString()].max;
        }
      } catch (e) {
        console.log("Error loading original filter metadata:", e);
      }
    }
    const allFalse =
      filteredMetadata[cat.toString()].hasOwnProperty("filterActive") &&
      filteredMetadata[cat.toString()].items.every((t) => t.checked === false);

    if (
      allFalse &&
      filteredMetadata[cat.toString()].hasOwnProperty("filterActive")
    ) {
      filteredMetadata[cat.toString()].filterActive = false;
    }
    this.props.onChipChange(filteredMetadata);
  }

  // Render variant-type chips with INS/DEL collapsed into group chips.
  renderVariantTypeChips(el: any, count: number) {
    const checkedItems = el.data.items.filter((p: any) => p.checked);
    if (checkedItems.length === 0) {
      return null;
    }
    const rows = buildVariantTypeChipRows(checkedItems);

    return (
      <div key={count}>
        <div style={styles.chipCat}>
          {lables[el.cat.toString()]}
          {rows.map((row, i) => (
            <div style={styles.chipLayout} key={i}>
              <div style={styles.chip}>
                <span>{row.label.replace(/_/g, " ")}</span>
                <FontAwesomeIcon
                  style={{
                    paddingLeft: ".5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => this.removeVariantTypeGroup(row.members)}
                  icon={faXmark}
                  className="clear-search-icon"
                  caria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { chips } = this.state;
    return (
      <div style={styles.chipFormat}>
        {chips.length > 0 &&
          chips.map((el, count) => {
            // Special handling for variantType — collapse INS/DEL into group chips.
            if (
              el.cat === "variantType" &&
              el.data.hasOwnProperty("filterActive")
            ) {
              return this.renderVariantTypeChips(el, count);
            }

            if (el.data.hasOwnProperty("filterActive")) {
              return (
                <div key={count}>
                  {" "}
                  {el.data.items.some((p) => p.checked) && (
                    <div style={styles.chipCat}>
                      {lables[el.cat.toString()]}
                      {el.data.items.map((item, i) => {
                        let chipLabel = item.option
                          ? item.option
                          : "(undefined)";

                        if (el.cat === "consequence") {
                          chipLabel = chipLabel.trim().toLowerCase();
                        }
                        return (
                          <div style={styles.chipLayout} key={i}>
                            {item.checked && (
                              <div style={styles.chip}>
                                <span>{chipLabel.replace(/_/g, " ")}</span>
                                <FontAwesomeIcon
                                  style={{
                                    paddingLeft: ".5rem",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => this.removeChip(item, el.cat)}
                                  icon={faXmark}
                                  className="clear-search-icon"
                                  caria-hidden="true"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div key={count}>
                  {el.data.checked && (
                    <div style={styles.chipCat}>
                      {el.data.checked && (
                        <div style={styles.chipLayout}>
                          {lables[el.cat.toString()]}
                          <div style={styles.chip}>
                            <span style={{ fontFamily: "GothamBook" }}>
                              Min&nbsp;
                            </span>
                            <span>{formatChipValue(el.cat, el.data.min)} </span>
                            <span style={{ fontFamily: "GothamBook" }}>
                              &nbsp;|&nbsp;Max&nbsp;
                            </span>
                            <span>{formatChipValue(el.cat, el.data.max)}</span>
                            <FontAwesomeIcon
                              style={{
                                paddingLeft: ".5rem",
                                cursor: "pointer",
                              }}
                              onClick={() => this.removeChip(el, el.cat)}
                              icon={faXmark}
                              className="clear-search-icon"
                              caria-hidden="true"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          })}
      </div>
    );
  }
}