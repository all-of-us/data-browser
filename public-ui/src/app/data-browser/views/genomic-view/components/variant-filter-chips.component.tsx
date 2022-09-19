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

const lables = {
    gene: 'Gene',
    consequence: 'Consequence',
    clinicalSignificance: 'Clinical Significance',
    alleleNumber: 'Allele Number',
    alleleFrequency: 'Allele Frequency',
    alleleCount: 'Allele Count'
};

const styles = reactStyles({

    chipCat: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingLeft: '0.25rem'
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
    },
    chipFormat: {
        fontSize: '.8em',
        display: 'flex',
        flexWrap: 'wrap'
    },
    chipLayout: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
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
        const {filteredMetadata} = this.props;
        if (Array.isArray(filteredMetadata[cat.toString()])) {
            filteredMetadata[cat.toString()] = filteredMetadata[cat.toString()].filter(el => {
                if (item === el) {
                    item.checked = false;
                }
                return el;
            });
        } else {
            filteredMetadata[cat.toString()].checked = false;
        }
        const allFalse = Array.isArray(filteredMetadata[cat.toString()]) &&
            filteredMetadata[cat.toString()].every(t => t.checked === false);
        console.log(allFalse, 'allfase');

        if (allFalse && Array.isArray(filteredMetadata[cat.toString()])) {
            filteredMetadata[cat.toString()].forEach(el => el.checked = true);
        }
        this.props.onChipChange(filteredMetadata);
    }

    render() {
        const { chips } = this.state;       
        return <div style={styles.chipFormat}>
            {chips.length > 0 && chips.map((el, count) => {
                if (Array.isArray(el.data)) {
                    return <div key={count}> {el.data.some((p) => p.checked) && <div style={styles.chipCat}>{lables[el.cat.toString()]}
                        {el.data.map((item, i) => {
                            return <div style={styles.chipLayout} key={i}>
                                {item.checked && <div style={styles.chip} >
                                    <span >{item.option}</span>
                                    <i style={{ paddingLeft: '.5rem', cursor: 'pointer' }}
                                        onClick={() => this.removeChip(item, el.cat)}
                                        className='far fa-times fa-1x clear-search-icon'
                                        caria-hidden='true'></i>
                                </div>}
                            </div>;
                        })}
                    </div>}
                    </div>;
                } else {
                    return <div key={count}>{el.data.checked && <div style={styles.chipCat}>
                        {el.data.checked &&
                            <div style={styles.chipLayout}>{lables[el.cat.toString()]}
                                <div style={styles.chip}> 
                                <span style={{fontFamily:'GothamBook'}}>Min&nbsp;</span>
                                <span>{el.data.min} </span>
                                <span style={{fontFamily:'GothamBook'}}>&nbsp;|&nbsp;Max&nbsp;</span>
                                <span>{el.data.max}</span>
                                    <i style={{ paddingLeft: '.5rem', cursor: 'pointer' }}
                                        onClick={() => this.removeChip(el, el.cat)}
                                        className='far fa-times fa-1x clear-search-icon'
                                        caria-hidden='true'></i>
                                </div>
                            </div>}
                    </div>}
                    </div>;
                }

            })}
        </div>;
    }
}
