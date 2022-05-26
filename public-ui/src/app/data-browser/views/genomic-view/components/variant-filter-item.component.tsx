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
        padding: '1rem 0'
    }
});

interface Props {
    filterItem: any;
    category: Cat;
    onFilterChange: Function;
}

interface State {
    filterItemOpen: Boolean;
    filterItemState: any;
    filterCheckMap: any;
    sliderMax: number;
    sliderMin: number;
}

export class VariantFilterItemComponent extends React.Component<Props, State> {
    min: number;
    max: number;
    constructor(props: Props) {
        super(props);
        this.state = {
            filterItemOpen: false,
            filterItemState: props.filterItem || '',
            filterCheckMap: props.filterItem || '',
            sliderMax: props.filterItem.max,
            sliderMin: props.filterItem.min
        };
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

    selecting(value: boolean) {
        this.state.filterItemState.forEach(el => {
            el.checked = value;
        });
        this.setState({ filterItemState: this.state.filterItemState });
        this.props.onFilterChange(this.state.filterItemState, this.props.category);
    }
    handleCheck(filteredItem) {
        const filtered = this.state.filterItemState.map(el => el === filteredItem ? { ...el, checked: !filteredItem.checked } : el);
        console.log(filtered, 'filtered');
        this.setState({
            filterItemState: filtered,
            filterCheckMap: filtered
        });
        this.props.onFilterChange(filtered, this.props.category);
    }

    handleRangeSelect(event, isMax) {
        const sliderValue = Number(event.target.value);
        if (isMax) {
            this.state.filterItemState.max = sliderValue;
            this.max = sliderValue;
        } else {
            this.state.filterItemState.min = sliderValue;
            this.min = sliderValue;
        }
        this.props.onFilterChange(this.state.filterItemState, this.props.category);
    }

    render(): React.ReactNode {
        const { category } = this.props;
        const { filterItemOpen, filterItemState } = this.state;
        return <React.Fragment >
            <div onClick={() => this.filterClick()} style={styles.filterItem}>
                <span>{category.display}</span>
                <div><ClrIcon style={!filterItemOpen ? { ...styles.filterItemClosed } : { ...styles.filterItemOpen }} shape='angle' /></div>
            </div>
            {(filterItemOpen && Array.isArray(filterItemState)) ? <div style={styles.filterItemForm}>
                <input style={styles.textFilter} type='input' onChange={(e) => this.filterBySearch(e)} />
                <div style={styles.selectContainer}>
                    <span>Select</span><button style={styles.selectBtn} onClick={() => this.selecting(true)}> All</button>
                    <span>|</span>
                    <button style={styles.selectBtn} onClick={() => this.selecting(false)} >None</button>
                </div>
                {filterItemState.map((item: any, index: number) => {
                    const key = 'option' + index;
                    return <span style={styles.filterItemOption} key={key}>
                        <input onChange={() => this.handleCheck(item)}
                            id={item.option} style={styles.filterItemCheck} type='checkbox' name={item.option} checked={item.checked} />
                        <label style={styles.filterItemLabel} htmlFor={item.option}>{item.option}</label>
                    </span>;
                })}
            </div> : <div>
                {filterItemOpen && <div style={styles.filterItemForm}>
                    <label>min #todo </label>
                    <input style={styles.filterSlider} type='range'
                        step={filterItemState.maxFreq} defaultValue={filterItemState.min}
                        onChange={(e) => this.handleRangeSelect(e, false)} id={filterItemState.option} name={'slider'} />
                    <label>max #todo {}</label>
                    <input style={styles.filterSlider} type='range'
                        step={filterItemState.maxFreq} defaultValue={filterItemState.max}
                        onChange={(e) => this.handleRangeSelect(e, true)} id={filterItemState.option} name={'slider'} />
                </div>}
            </div>
            }
        </React.Fragment>;
    }

}
