import { VariantFilterItemComponent } from 'app/data-browser/views/genomic-view/components/variant-filter-item.component';
import { reactStyles } from 'app/utils';
import { GenomicFilters } from 'publicGenerated';
import * as React from 'react';

const styles = reactStyles({
    filterBox: {
        top: '.5rem',
        position: 'absolute',
        padding: '.5rem',
        zIndex: 10,
        borderRadius: '0 6px 6px 0',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.15), 0 0 2px 0 rgba(0,0,0,0.25), 0 2px 2px 0 rgba(0,0,0,0.15)',
        width: '264px',
        height: '421px'
    },
    filterItemHandleClosed: {
        transform: 'rotate(90deg)'
    },
    actionBtnContainer: {
        position: 'absolute',
        bottom: '.5rem',
        width: '100%',
        display: 'flex',
        fontSize: '1.1em'
    },
    clearBtn: {
        textTransform: 'uppercase',
        borderRadius: '2px',
        padding: '1rem',
        border: 'none',
        background: 'transparent',
        width: '45%',
    },
    applyBtn: {
        textTransform: 'uppercase',
        borderRadius: '2px',
        padding: '1rem',
        border: 'none',
        background: '#262262',
        color: 'white',
        width: '45%'
    },
    filterItems: {
        maxHeight: '340px',
        overflowY: 'scroll'
    }
});

export interface Cat {
    display: String;
    field: String;
}

interface Props {
    filterMetadata: GenomicFilters;
    onFilterChange: Function;
    onFilterSubmit: Function;
}
interface State {
    filterCats: Cat[];
    filteredMetadata: any;
}

export class VariantFilterComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            filterCats: [
                { display: 'Gene', field: 'gene' },
                { display: 'Consequence', field: 'consequence' },
                { display: 'Clinical Significance', field: 'clinicalSignificance' },
                { display: 'Allele Count', field: 'alleleCount' },
                { display: 'Allele Number', field: 'alleleNumber' },
                { display: 'Allele Frequency', field: 'alleleFrequency' },
            ],
            filteredMetadata: this.props.filterMetadata
        };
    }

    handleFilterChange(filteredItem: GenomicFilters, cat: Cat) {
        const filterMetadataChange = this.props.filterMetadata;
        filterMetadataChange[cat.field] = filteredItem
        this.setState({ filteredMetadata: filterMetadataChange });
        this.props.onFilterChange(filteredItem)
    }

    submitFilter(filteredMetadata: GenomicFilters) {
        filteredMetadata = this.state.filteredMetadata;
        this.props.onFilterSubmit(filteredMetadata);
    }

    render() {
        const { filterMetadata } = this.props;
        const { filterCats, filteredMetadata } = this.state;
        return <div style={styles.filterBox}>
            <div style={styles.filterItems}>
                {filterCats.map((cat, index) => {
                    const key = 'cat' + index;
                    {
                        return filterMetadata &&
                            <VariantFilterItemComponent
                                onFilterChange={(e) => this.handleFilterChange(e, cat)}
                                key={key} category={cat}
                                filterItem={filteredMetadata[cat.field.toString()]} />;
                    }
                })
                }
                <div style={styles.actionBtnContainer}>
                    <button style={styles.clearBtn}>Clear</button>
                    <button onClick={() => this.submitFilter(filteredMetadata)} style={styles.applyBtn}>Apply</button>
                </div>
            </div>
        </div>;
    }
}
