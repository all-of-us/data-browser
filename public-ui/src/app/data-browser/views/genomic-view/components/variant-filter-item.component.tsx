import * as React from "react";

import { Cat } from "app/data-browser/views/genomic-view/components/variant-filter.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { VariantFilterSliderComponent } from './slider-filter/variant-filter-slider.component'

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
    cursor: "pointer"
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
    flexDirection: "column",
    paddingLeft: "1rem",
    maxHeight: "10rem",
    overflowY: "auto",
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
    wordWrap: "break-word",
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
  ogFilterItem: any;
  category: Cat;
  onFilterChange: Function;
}
interface State {
  filterItemOpen: Boolean;
  filterItemState: any;
  filterCheckMap: any;
  ogFilterMetaData: string;
}

export class VariantFilterItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      filterItemOpen: false,
      filterItemState: props.filterItem || '',
      filterCheckMap: props.filterItem || '',
      ogFilterMetaData:  JSON.parse(localStorage.getItem("originalFilterMetadata")|| '{}')[this.props.category.field.toString()]
    };
  }

  componentDidMount(): void {
    if (Array.isArray(this.state.filterCheckMap) && this.state.filterCheckMap.every(t => t.checked)) {
      this.state.filterCheckMap.forEach(i => i.checked = false);
    }
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
    const filtered = this.state.filterItemState.map(el => el === filteredItem ? { ...el, checked: !filteredItem.checked } : el);
    this.setState({
      filterItemState: filtered,
      filterCheckMap: filtered
    });
  this.props.onFilterChange(filtered, this.props.category);
  }

  // handleRangeSelect(event, isMax) {
  //     console.log(this.state.filterItemState, 'this.state.filterItemState');

  //     const maxSliderValue = isMax && event.target.value;
  //     const minSliderValue = !isMax && event.target.value;
  //     console.log('max', this.max, maxSliderValue, this.min, 'min', minSliderValue);

  //     if (isMax) {
  //         console.log(this.props.filterItem.max, maxSliderValue, 'this is max');
  //         this.max = maxSliderValue;
  //         this.state.filterItemState.max = this.max;
  //     } else {
  //         console.log(this.props.filterItem.min, minSliderValue, 'this is min');
  //         // this.min = minSliderValue;
  //         this.setState({ filterItemMin: this.min });
  //     }
  //     this.state.filterItemState.checked = true;
  //     this.props.onFilterChange(this.state.filterItemState, this.props.category);
  //     this.state.filterItemState.checked = true;
  //     this.props.onFilterChange(this.state.filterItemState, this.props.category);
  // }

  handleSliderChange(vals,filterItem) {
    const updatedFilterItem = filterItem;
    updatedFilterItem.min = vals[0];
    updatedFilterItem.max = vals[1];
    updatedFilterItem.checked = true;
    this.props.onFilterChange(updatedFilterItem,this.props.category);
  }

  render(): React.ReactNode {
    const { category } = this.props;
    const { filterItemOpen, filterItemState,ogFilterMetaData } = this.state;
    return <React.Fragment>
      <style>{css}</style>
      <div onClick={() => this.filterClick()} style={styles.filterItem}>
        <span>{category.display}</span>
        <div><ClrIcon style={!filterItemOpen ? { ...styles.filterItemClosed } : { ...styles.filterItemOpen }} shape='angle' /></div>
      </div>
      {(filterItemOpen && Array.isArray(filterItemState)) ? <div style={styles.filterItemForm}>
        {/* <input style={styles.textFilter} type='input' onChange={(e) => this.filterBySearch(e)} />
                <div style={styles.selectContainer}>
                    <span>Select</span><button style={styles.selectBtn} onClick={() => this.selecting(true)}> All</button>
                    <span>|</span>
                    <button style={styles.selectBtn} onClick={() => this.selecting(false)} >None</button>
                </div> */}
        {filterItemState.map((item: any, index: number) => {
          const key = 'option' + index;
          return <span style={styles.filterItemOption} key={key}>
            <input onChange={() => this.handleCheck(item)}
              id={item.option}
              style={styles.filterItemCheck}
              type='checkbox' name={item.option}
              checked={item.checked} />
            <label style={styles.filterItemLabel} htmlFor={item.option}>{item.option}</label>
          </span>;
        })}
      </div> :
        <div>{filterItemOpen &&
          <VariantFilterSliderComponent
            filterItem={filterItemState}
            ogFilterItem={ogFilterMetaData}
            onSliderChange={(e) => this.handleSliderChange(e,filterItemState)} />}
        </div>}
    </React.Fragment>;
  }
}
