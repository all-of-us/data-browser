import * as React from "react";

import { Cat } from "app/data-browser/views/genomic-view/components/variant-filter.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";

import { VariantFilterInputsComponent } from "app/data-browser/views/genomic-view/components/slider-filter/variant-filter-inputs.component";

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
    // wordWrap: "break-word",
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
  ogFilterMetaData: any;
}

export class VariantFilterItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filterItemOpen: false,
      filterItemState: props.filterItem || "",
      filterCheckMap: props.filterItem || "",
      ogFilterMetaData: this.readOgFilterItem(),
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

  // Filter options arrive asynchronously. If a new filterItem lands while this
  // component is already mounted, pick it up instead of keeping the value
  // snapshotted at construction.
  componentDidUpdate(prevProps: Readonly<Props>) {
    const { filterItem } = this.props;
    if (prevProps.filterItem !== filterItem) {
      this.setState({
        filterItemState: filterItem || "",
        filterCheckMap: filterItem || "",
        // Written to localStorage by the same call that returns filterItem.
        ogFilterMetaData: this.readOgFilterItem(),
      });
    }
  }

  // The dataset defaults for this category. Returns an empty object rather than
  // undefined so the inputs never dereference a missing key.
  readOgFilterItem() {
    const og = JSON.parse(
      localStorage.getItem("originalFilterMetadata") || "{}"
    );
    return og[this.props.category.field.toString()] || {};
  }

  filterClick() {
    this.setState({ filterItemOpen: !this.state.filterItemOpen });
  }

  // filterBySearch(e) {
  //   if (e.target.value) {
  //     this.setState({
  //       filterItemState: this.state.filterItemState.filter(
  //         (item) =>
  //           item.option && item.option.toLowerCase().startsWith(e.target.value)
  //       ),
  //     });
  //   } else {
  //     this.setState({ filterItemState: this.state.filterCheckMap });
  //   }
  // }

  handleCheck(filteredItem) {
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

  // Receives [min, max] from the range inputs. The prop is still called
  // onSliderChange on the inputs component so this contract is unchanged from
  // when a slider was rendered here.
  handleSliderChange(vals, filterItem) {
    const updatedFilterItem = { ...filterItem };
    updatedFilterItem.min = vals[0];
    updatedFilterItem.max = vals[1];
    updatedFilterItem.checked = true;
    this.props.onFilterChange(updatedFilterItem, this.props.category);
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
            {/* <input style={styles.textFilter} type='input' onChange={(e) => this.filterBySearch(e)} />
                <div style={styles.selectContainer}>
                    <span>Select</span><button style={styles.selectBtn} onClick={() => this.selecting(true)}> All</button>
                    <span>|</span>
                    <button style={styles.selectBtn} onClick={() => this.selecting(false)} >None</button>
                </div> */}
            {filterItemState.items.map((item: any, index: number) => {
              const key = "option" + index;
              const itemLabel = item.option ? item.option : "(undefined)";
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
                  {/* Display-only underscore removal — item.option stays raw, since
                      it is what gets submitted to and matched by the API. */}
                  <label style={styles.filterItemLabel} htmlFor={item.option}>
                    {itemLabel.replace(/_/g, " ")}
                  </label>
                </span>
              );
            })}
          </div>
        ) : (
          <div>
            {filterItemOpen && (
              <VariantFilterInputsComponent
                category={category.field.toString()}
                filterItem={filterItemState}
                ogFilterItem={ogFilterMetaData}
                onSliderChange={(_e) =>
                  this.handleSliderChange(_e, filterItemState)
                }
              />
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}