import * as React from 'react';
import { ClrIcon } from 'app/utils/clr-icon';
import { reactStyles } from 'app/utils';
import { Cat } from 'app/data-browser/views/genomic-view/components/variant-filter.component';

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
    }
})

interface Props {
    filterItem: any;
    category: Cat;
}

interface State {
    filterItemOpen: Boolean;
    filterItemState: any;
    filterCheckMap: any;
}

export class VariantFilterItemComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            filterItemOpen: false,
            filterItemState: props.filterItem || "",
            filterCheckMap: props.filterItem || "",
        }
    }

    filterClick() {
        this.setState({ filterItemOpen: !this.state.filterItemOpen });
    }

    handleCheck(filteredItem) {
        const filtered = this.state.filterItemState.map(el => el === filteredItem ? { ...el, checked: !filteredItem.checked } : el)
        this.setState({
            filterItemState: filtered,
            filterCheckMap: filtered
        });
    }

    filterBySearch(e) {
        if (e.target.value) {
            this.setState({ filterItemState: this.state.filterItemState.filter(item => item.option && item.option.toLowerCase().startsWith(e.target.value)) })
        } else {
            this.setState({ filterItemState: this.state.filterCheckMap })
        }
    }

    selectAll() {
        this.state.filterItemState.forEach(el => {
            el.checked = true
        });
        this.setState({ filterItemState: this.state.filterItemState });
    }

    selectNone() {
        this.state.filterItemState.forEach(el => {
            el.checked = false
        });
        this.setState({ filterItemState: this.state.filterItemState });
        
        // this.setState({ filterItemState: unchecked })
    }

    render(): React.ReactNode {
        const { category } = this.props;
        const { filterItemOpen, filterItemState } = this.state;
        return <React.Fragment >
            <div onClick={() => this.filterClick()} style={styles.filterItem}>
                <span>{category.display}</span>
                <div><ClrIcon style={!filterItemOpen ? { ...styles.filterItemClosed } : { ...styles.filterItemOpen }} shape='angle' /></div>
            </div>
            {filterItemOpen && <div style={styles.filterItemForm}>
                <input style={styles.textFilter} type="input" onChange={(e) => this.filterBySearch(e)} />
                <div style={styles.selectContainer}>
                    <span>Select</span><button style={styles.selectBtn} onClick={() => this.selectAll()}> All</button>
                    <span>|</span>
                    <button style={styles.selectBtn} onClick={() => this.selectNone()} >None</button>
                </div>
                {Array.isArray(filterItemState) && filterItemState.map((item: any, index: number) => {
                    const key = 'option' + index;
                    return <span style={styles.filterItemOption} key={key}>
                        <input onChange={() => this.handleCheck(item)} id={item.option} style={styles.filterItemCheck} type="checkbox" name={item.option} checked={item.checked} />
                        <label style={styles.filterItemLabel} htmlFor={item.option}>{item.option}</label>
                    </span>
                })}
            </div>
            }

        </React.Fragment>
    }

}