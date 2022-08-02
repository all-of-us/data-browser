import { reactStyles } from 'app/utils';
import { GenomicFilters } from 'publicGenerated';
import * as React from 'react';

interface Props {
    filteredMetadata: GenomicFilters;
    onChipChange: Function;
}
interface State {
    chips: Array<any>;

}

const styles = reactStyles({

    chipCat: {
        display: 'flex',
        alignItems: 'center'
    },
    chip: {
        display: 'flex',
        alignItems: 'center',
        border: '1px #216fb4 solid',
        color: 'rgb(33, 111, 180)',
        padding: '.05rem .5rem',
        borderRadius: '15px',
        fontFamily: 'GothamBold',
        margin: '.25rem .25rem'
    }
});
export class VariantFilterChips extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            chips: []
        };
    }

    formatChips(filteredMetadata): Array<any> {
        const displayArr = [];
        for (const key in filteredMetadata) {
            if (Object.prototype.hasOwnProperty.call(filteredMetadata, key)) {
                const allChecked = Array.isArray(filteredMetadata[key]) && filteredMetadata[key].every((t => t.checked));
                if (!allChecked) {
                    const el = filteredMetadata[key];
                    displayArr.push({ cat: key, data: el });
                }

            }
        }
        return displayArr;
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps !== this.props) {
            this.setState({ chips: this.formatChips(this.props.filteredMetadata) });
        }
    }

    removeChip(item, cat) {
        this.props.filteredMetadata[cat.toString()] = this.props.filteredMetadata[cat.toString()].filter(el => {
            if (item === el) {
                item.checked = false;
            }
            return el;
        });
        const allFalse = Array.isArray(this.props.filteredMetadata[cat.toString()]) &&
        this.props.filteredMetadata[cat.toString()].every(t => t.checked === false);
        console.log(allFalse, 'allfase');

        if (allFalse && Array.isArray(this.props.filteredMetadata[cat.toString()])) {
            this.props.filteredMetadata[cat.toString()].forEach(item =>item.checked = true);
        }
        this.props.onChipChange(this.props.filteredMetadata);
    }

    render() {
        const { chips } = this.state;
        return <div style={{ fontSize: '.8em' }}>
            {chips.length > 0 && chips.map((el, count) => {
                if (Array.isArray(el.data)) {
                    return <div key={count}> {el.data.some((p) => p.checked) && <div style={styles.chipCat}>{el.cat}
                        {el.data.map((item, i) => {
                            return <div style={{ display: 'flex', justifyContent: 'space-between' }} key={i}>
                                {item.checked && <div style={styles.chip} > <span >{item.option}</span>
                                    <i style={{ paddingLeft: '.5rem', cursor: 'pointer' }}
                                        onClick={() => this.removeChip(item, el.cat)}
                                        className='far fa-times fa-1x clear-search-icon'
                                        caria-hidden='true'></i></div>}
                            </div>;
                        })}
                    </div>}
                    </div>;
                } else {
                    return <span key={count}>{(el.data.checked && el.data.checked) &&
                        <div>{el.cat}<div>{el.data.min}+{el.data.max}</div></div>}</span>;
                }

            })}
        </div>;
    }
}
