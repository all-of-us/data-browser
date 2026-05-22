import * as React from "react";

import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";

import { SVVariantFilterInputsComponent } from "./slider-filter/sv-variant-filter-inputs.component";
import { Cat } from "./sv-variant-filter.component";

const styles = reactStyles({
  filterItem: {
    width: "100%",
    padding: ".5rem",
    paddingBottom: "0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#262262",
    fontSize: ".8em",
    letterSpacing: 0,
    lineHeight: "16px",
    cursor: "pointer",
  },
  filterItemClosed: {
    transform: "rotate(90deg)",
  },
  filterItemOpen: {
    transform: "rotate(180deg)",
  },
  selectContainer: {
    width: "100%",
    display: "flex",
  },
  textFilter: {
    border: "solid rgba(74,74,74,0.4) 1px",
  },
  selectBtn: {
    border: "none",
    background: "transparent",
    color: "#216FB4",
  },
  selectNoBtn: {
    border: "none",
    background: "transparent",
    color: "#216FB4",
  },
  filterItemForm: {
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    paddingLeft: "1rem",
    paddingTop: ".25rem",
  },
  filterItemOption: {
    fontSize: ".8em",
    display: "flex",
  },
  filterItemCheck: {
    marginRight: ".25rem",
    height: ".8rem",
    width: ".8rem",
    marginTop: "0.1rem",
  },
  filterItemLabel: {
    width: "80%",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  filterSlider: {
    padding: "1rem 0",
  },
});

const css = `
    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 25px;
        background: transparent;
        outline: none;
        opacity: 0.7;
        -webkit-transition: .2s;
        transition: opacity .2s;
      }
`;

// Variant Type groups: any raw variant_type whose stripped prefix matches one
// of these is rolled up into a single parent checkbox.
const VARIANT_TYPE_GROUPS = ["INS", "DEL"];

// Strip the surrounding <> from a variant type, e.g. "<INS:ME:ALU>" -> "INS:ME:ALU".
function stripBrackets(raw: string): string {
  if (!raw) {
    return "";
  }
  return raw.replace(/^<|>$/g, "");
}

// Return the group an item belongs to ("INS", "DEL"), or null if it stands alone.
function groupFor(rawOption: string): string | null {
  const stripped = stripBrackets(rawOption);
  for (const group of VARIANT_TYPE_GROUPS) {
    if (stripped === group || stripped.startsWith(group + ":")) {
      return group;
    }
  }
  return null;
}

interface DisplayRow {
  label: string;       // what the user sees ("INS", "DEL", "CTX", ...)
  isGroup: boolean;    // true for INS/DEL aggregate rows
  members: any[];      // underlying item refs from filterItemState.items
  checked: boolean;    // aggregate checked state (all members checked)
}

// Collapse the raw items list into the user-facing rows.
function buildDisplayRows(items: any[]): DisplayRow[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const groupBuckets: Record<string, any[]> = {};
  const standalone: any[] = [];

  for (const item of items) {
    const g = groupFor(item.option);
    if (g) {
      if (!groupBuckets[g]) {
        groupBuckets[g] = [];
      }
      groupBuckets[g].push(item);
    } else {
      standalone.push(item);
    }
  }

  const rows: DisplayRow[] = [];

  // Emit group rows in the configured order (DEL, INS — matches typical UX).
  for (const group of VARIANT_TYPE_GROUPS) {
    if (groupBuckets[group] && groupBuckets[group].length > 0) {
      const members = groupBuckets[group];
      const allChecked = members.every((m) => m.checked);
      rows.push({
        label: group,
        isGroup: true,
        members,
        checked: allChecked,
      });
    }
  }

  // Then standalone variants in their original order.
  for (const item of standalone) {
    rows.push({
      label: stripBrackets(item.option),
      isGroup: false,
      members: [item],
      checked: !!item.checked,
    });
  }

  return rows;
}

interface Props {
  filterItem: any;
  category: Cat;
  onFilterChange: Function;
  cleared: Boolean;
}
interface State {
  filterItemOpen: Boolean;
  filterItemState: any;
  filterCheckMap: any;
  ogFilterMetaData: string;
}

export class SVVariantFilterItemComponent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filterItemOpen: false,
      filterItemState: props.filterItem || "",
      filterCheckMap: props.filterItem || "",
      ogFilterMetaData: JSON.parse(
        localStorage.getItem("svOriginalFilterMetadata") || "{}"
      )[this.props.category.field.toString()],
    };
  }

  componentDidMount(): void {
    if (
      Array.isArray(this.state.filterCheckMap.items) &&
      this.state.filterCheckMap.items.every((t) => t.checked)
    ) {
      this.state.filterCheckMap.items.forEach((i) => (i.checked = false));
    }
  }

  filterClick() {
    this.setState({ filterItemOpen: !this.state.filterItemOpen });
  }

  // Toggle one display row. For grouped rows this flips every member;
  // for standalone rows it just flips the single item.
  handleDisplayRowToggle(row: DisplayRow) {
    const { filterItemState, filterCheckMap } = this.state;
    const newChecked = !row.checked;

    // Build the new items array, flipping membership for any items in this row.
    const memberSet = new Set(row.members);
    const newItems = filterItemState.items.map((el) =>
      memberSet.has(el) ? { ...el, checked: newChecked } : el
    );

    const anyChecked = newItems.some((x) => x.checked === true);

    const newFilterItemState = { ...filterItemState, items: newItems, filterActive: anyChecked };
    const newFilterCheckMap = { ...filterCheckMap, items: newItems, filterActive: anyChecked };

    this.setState({
      filterItemState: newFilterItemState,
      filterCheckMap: newFilterCheckMap,
    });
    this.props.onFilterChange(newFilterItemState, this.props.category);
  }

  handleCheck(filteredItem) {
    // Used for the non-variantType list (Consequence, Filter, etc.) — original behavior.
    const { filterItemState, filterCheckMap } = this.state;
    const newFilterItemState = { ...filterItemState };
    const newFilterCheckMap = { ...filterCheckMap };
    const filtered = this.state.filterItemState.items.map((el) =>
      el === filteredItem ? { ...el, checked: !filteredItem.checked } : el
    );
    const filterCheckedFlag = filtered.find((x) => x.checked === true)
      ? true
      : false;
    newFilterItemState.items = filtered;
    newFilterItemState.filterActive = filterCheckedFlag;
    newFilterCheckMap.items = filtered;
    newFilterCheckMap.filterActive = filterCheckedFlag;
    this.setState({
      filterItemState: newFilterItemState,
      filterCheckMap: newFilterCheckMap,
    });
    this.props.onFilterChange(newFilterItemState, this.props.category);
  }

  handleSliderChange(vals, filterItem) {
    const updatedFilterItem = { ...filterItem };
    updatedFilterItem.min = vals[0];
    updatedFilterItem.max = vals[1];
    updatedFilterItem.checked = true;
    this.props.onFilterChange(updatedFilterItem, this.props.category);
  }

  // Variant Type uses the grouped renderer; everything else (Consequence, Filter)
  // uses the per-item renderer.
  renderCheckboxList() {
    const { category } = this.props;
    const { filterItemState } = this.state;

    if (category.field === "variantType") {
      const displayRows = buildDisplayRows(filterItemState.items);
      return displayRows.map((row, index) => {
        const key = "vtgroup-" + index;
        const idAttr = "vt-" + row.label;
        return (
          <span
            title={row.label}
            style={styles.filterItemOption}
            key={key}
          >
            <input
              onChange={() => this.handleDisplayRowToggle(row)}
              id={idAttr}
              style={styles.filterItemCheck}
              type="checkbox"
              name={idAttr}
              checked={row.checked}
            />
            <label style={styles.filterItemLabel} htmlFor={idAttr}>
              {row.label}
            </label>
          </span>
        );
      });
    }

    // Non-variantType: render every item individually (original behavior).
    return filterItemState.items.map((item: any, index: number) => {
      const key = "option" + index;
      let itemLabel = item.option ? item.option : "(undefined)";

      if (category.field === "consequence") {
        itemLabel = itemLabel.trim().toLowerCase();
      }

      return (
        <span
          title={item.option}
          style={styles.filterItemOption}
          key={key}
        >
          <input
            onChange={() => this.handleCheck(item)}
            id={item.option}
            style={styles.filterItemCheck}
            type="checkbox"
            name={item.option}
            checked={item.checked}
          />
          <label style={styles.filterItemLabel} htmlFor={item.option}>
            {itemLabel.replace(/_/g, " ")}
          </label>
        </span>
      );
    });
  }

  render(): React.ReactNode {
    const { category, cleared } = this.props;
    const { filterItemOpen, filterItemState, ogFilterMetaData } = this.state;
    return (
      <React.Fragment>
        <style>{css}</style>
        <div onClick={() => this.filterClick()} style={styles.filterItem}>
          <span style={{ fontFamily: "gothamBold" }}>{category.display}</span>
          <div>
            <ClrIcon
              style={
                !filterItemOpen
                  ? { ...styles.filterItemClosed }
                  : { ...styles.filterItemOpen }
              }
              shape="angle"
            />
          </div>
        </div>
        {cleared && filterItemOpen && Array.isArray(filterItemState.items) ? (
          <div style={styles.filterItemForm}>
            {this.renderCheckboxList()}
          </div>
        ) : (
          <div>
            {filterItemOpen && (
              <SVVariantFilterInputsComponent
                category={category.field.toString()}
                filterItem={filterItemState}
                ogFilterItem={ogFilterMetaData}
                onSliderChange={(e) =>
                  this.handleSliderChange(e, filterItemState)
                }
              />
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}