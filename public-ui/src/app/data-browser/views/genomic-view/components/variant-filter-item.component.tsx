import { VariantFilterSliderComponent } from 'app/data-browser/views/genomic-view/components/slider-filter/variant-filter-slider.component';
import { Cat } from 'app/data-browser/views/genomic-view/components/variant-filter.component';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

const styles = reactStyles({
    filterItem: {
        width: '100%',
        padding: '.5rem',
        paddingBottom: '0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#262262',
        fontSize: '.8em',
        letterSpacing: 0,
        lineHeight: '16px',

    },
    filterItemClosed: {
        transform: 'rotate(90deg)'
    },
    filterItemOpen: {
        transform: 'rotate(180deg)'
    },
    selectContainer: {
        width: '100%',
        display: 'flex',

    },
    textFilter: {
        border: 'solid rgba(74,74,74,0.4) 1px',
    },
    selectBtn: {
        border: 'none',
        background: 'transparent',
        color: '#216FB4'
    },
    selectNoBtn: {
        border: 'none',
        background: 'transparent',
        color: '#216FB4'
    },
    filterItemForm: {
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '1rem',
        maxHeight: '10rem',
        overflowY: 'scroll'
    },
    filterItemOption: {
        fontSize: '.8em',
        display: 'flex'
    },
    filterItemCheck: {
        marginRight: '.25rem',
        height: '.8rem',
        width: '.8rem',
        marginTop: '0.1rem'
    },
    filterItemLabel: {
        wordWrap: 'break-word'
    },
    filterSlider: {
        padding: '1rem 0',
    }
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
    filterItemMax: number;
    filterItemMin: number;
    filterCheckMap: any;
}

export class VariantFilterItemComponent extends React.Component<Props, State> {
    min = 1;
    max = this.props.filterItem.max;
    filterMax = this.props.filterItem.max;
    filterMin = this.props.filterItem.min;
    constructor(props: Props) {
        super(props);
        this.state = {
            filterItemOpen: false,
            filterItemState: props.filterItem || '',
            filterCheckMap: props.filterItem || '',
            filterItemMin: undefined,
            filterItemMax: undefined
        };
    }

    componentDidMount(): void {
        if (Array.isArray(this.state.filterCheckMap) && this.state.filterCheckMap.every(t => t.checked)) {
            this.state.filterCheckMap.forEach(i => i.checked = false);
        }
        console.log(this.state.filterCheckMap);

    }
    filterClick() {

        this.setState({ filterItemOpen: !this.state.filterItemOpen });
    }

    filterBySearch(e) {
        if (e.target.value) {
            this.setState({
                filterItemState: this.state.filterItemState
                    .filter(item => item.option && item.option.toLowerCase().startsWith(e.target.value))
            });
        } else {
            this.setState({ filterItemState: this.state.filterCheckMap });
        }
    }


    handleCheck(filteredItem) {
        console.log(filteredItem, 'chick');

        const filtered = this.state.filterItemState.map(el => el === filteredItem ? { ...el, checked: !filteredItem.checked } : el);
        this.setState({
            filterItemState: filtered,
            filterCheckMap: filtered
        });
        this.props.onFilterChange(filtered, this.props.category);
    }

    handleRangeSelect(event, isMax) {
        console.log(this.state.filterItemState, 'this.state.filterItemState');

        const maxSliderValue = isMax && event.target.value;
        const minSliderValue = !isMax && event.target.value;
        console.log('max', this.max, maxSliderValue, this.min, 'min', minSliderValue);

        if (isMax) {
            console.log(this.props.filterItem.max, maxSliderValue, 'this is max');
            this.max = maxSliderValue;
            this.state.filterItemState.max = this.max;
        } else {
            console.log(this.props.filterItem.min, minSliderValue, 'this is min');
            // this.min = minSliderValue;
            this.setState({ filterItemMin: this.min });
        }
        this.state.filterItemState.checked = true;
        this.props.onFilterChange(this.state.filterItemState, this.props.category);
    }

    render(): React.ReactNode {
        const { category } = this.props;
        const { filterItemOpen, filterItemState } = this.state;
        return <React.Fragment >
            <style>{css}</style>
            <div onClick={() => this.filterClick()} style={styles.filterItem}>
                <span>{category.display}</span>
                <div><ClrIcon style={!filterItemOpen ? { ...styles.filterItemClosed } : { ...styles.filterItemOpen }} shape='angle' /></div>
            </div>
            {(filterItemOpen && Array.isArray(filterItemState)) ? <div style={styles.filterItemForm}>
                {filterItemState.map((item: any, index: number) => {
                    const key = 'option' + index;
                    return <span style={styles.filterItemOption} key={key}>
                        <input onChange={() => this.handleCheck(item)}
                            id={item.option} style={styles.filterItemCheck} type='checkbox' name={item.option} checked={item.checked} />
                        <label style={styles.filterItemLabel} htmlFor={item.option}>{item.option}</label>
                    </span>;
                })}
            </div> :
                // <React.Fragment>
                // {filterItemOpen && <VariantFilterSliderComponent onSliderChange={(event,isMax)=>{this.handleRangeSelect(event,isMax)}}
                // ogFilterItem={ogFilterItem} min={this.min} max={this.props.filterItem.max}  />}</React.Fragment>
                // <div>
                //     {filterItemOpen && <div style={styles.filterItemForm}>
                //         <label>min {this.min} </label>
                //         <input className='slider' style={styles.filterSlider} type='range'
                //             defaultValue={0}
                //             max={this.max}
                //             onChange={(e) => this.handleRangeSelect(e, false)} id={filterItemState.option} name={'slider'} />
                //         <label>max {this.max}</label>
                //         <input style={styles.filterSlider} type='range'
                //             defaultValue={100}
                //             onChange={(e) => this.handleRangeSelect(e, true)} id={filterItemState.option} name={'slider'} />
                //     </div>}
                // </div>
                <span>{filterItemOpen && <VariantFilterSliderComponent onSliderChange={()=>this.filterClick()} min={this.min} max={this.max} />}</span>}
        </React.Fragment>;
    }

}
