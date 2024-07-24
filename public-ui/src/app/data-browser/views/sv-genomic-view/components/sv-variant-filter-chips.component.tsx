import { reactStyles } from 'app/utils';
import { GenomicFilters } from 'publicGenerated';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
    filteredMetadata: GenomicFilters;
    onChipChange: Function;
}
interface State {
    chips: Array<any>;

}

const lables = {
    variantId: 'Variant Id',
    variantType: 'Variant Type',
    consequence: 'Consequence',
    position: 'Position',
    size: 'Size',
    alleleNumber: 'Allele Number',
    alleleFrequency: 'Allele Frequency',
    alleleCount: 'Allele Count',
    homozygoteCount: 'Homozygote Count'
};

const styles = reactStyles({

    chipCat: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingRight: '0.25rem'
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
export class SVVariantFilterChips extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            chips: []
        };
    }

    formatChips(filteredMetadata): Array<any> {
        const displayArr = [];
        for (const key in filteredMetadata) {
            if (Object.prototype.hasOwnProperty.call(filteredMetadata, key) && filteredMetadata[key] !== undefined) {
                const allChecked = Array.isArray(filteredMetadata[key]) && filteredMetadata[key].every((t => t.checked));
                if (!allChecked) {
                    let el = filteredMetadata[key];
                    if (!el.hasOwnProperty("filterActive")) {
                        if (el.min < 1) {
                            el.min = +el.min.toFixed(2);
                        }
                        if (el.max < 1) {
                            el.max = +el.max.toFixed(2);
                        }
                    }
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
        if (filteredMetadata[cat.toString()].hasOwnProperty("filterActive")) {
            filteredMetadata[cat.toString()].items = filteredMetadata[cat.toString()].items.filter(el => {
                if (item === el) {
                    item.checked = false;
                }
                return el;
            });
        } else {
            filteredMetadata[cat.toString()].checked = false;
            try {
                let originalFilterMetadata = JSON.parse(localStorage.getItem("originalFilterMetadata") || '{}');
                filteredMetadata[cat.toString()]['min'] = originalFilterMetadata[cat.toString()]['min'];
                filteredMetadata[cat.toString()]['max'] = originalFilterMetadata[cat.toString()]['max'];
            } catch (e) {
              console.log('Error')
            }
        }
        const allFalse = (filteredMetadata[cat.toString()].hasOwnProperty("filterActive")) &&
            filteredMetadata[cat.toString()].items.every(t => t.checked === false);

        if (allFalse && filteredMetadata[cat.toString()].hasOwnProperty("filterActive")) {
            filteredMetadata[cat.toString()].filterActive = false;
        }
        this.props.onChipChange(filteredMetadata);
    }

    render() {
        const { chips } = this.state;
        return <div style={styles.chipFormat}>
            {chips.length > 0 && chips.map((el, count) => {
                if (el.data.hasOwnProperty("filterActive")) {
                    return <div key={count}> {el.data.items.some((p) => p.checked) && <div style={styles.chipCat}>{lables[el.cat.toString()]}
                        {el.data.items.map((item, i) => {
                            const chipLabel = item.option ? item.option : '(undefined)';
                            return <div style={styles.chipLayout} key={i}>
                                {item.checked && <div style={styles.chip} >
                                    <span >{chipLabel.replace(/_/g, " ")}</span>
                                    <FontAwesomeIcon style={{ paddingLeft: '.5rem', cursor: 'pointer' }}
                                    onClick={() => this.removeChip(item, el.cat)}
                                    icon={faXmark} className="clear-search-icon"
                                    caria-hidden='true'/>
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
                                    <FontAwesomeIcon style={{ paddingLeft: '.5rem', cursor: 'pointer' }}
                                    onClick={() => this.removeChip(el, el.cat)}
                                    icon={faXmark} className="clear-search-icon"
                                    caria-hidden='true'/>
                                </div>
                            </div>}
                    </div>}
                    </div>;
                }

            })}
        </div>;
    }
}
