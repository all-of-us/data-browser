import * as React from 'react';
import { GenomicFilters } from 'publicGenerated';
import { ClrIcon } from 'app/utils/clr-icon';
import { reactStyles } from 'app/utils';

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
    filterItem: {
        width: '100%',
        padding: '.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#262262',
        fontSize: '.8em',
        letterSpacing: 0,
        lineHeight: '16px'
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
    }
})

interface Cats {
    display: String, 
    field: String;
}

interface Props {
    filterMetadata: GenomicFilters;

}
interface State {
    filterCats: Cats[];
    filterOpen: Boolean;

}

export class VariantFilterComponent extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            filterCats: [
                {display: 'Gene', field: 'gene'},
                {display: 'Consequence', field: 'consequence'},
                {display: 'Clinical Significance', field: 'clinicalSignificance'},
                {display: 'Allele Count', field: 'alleleCount'},
                {display: 'Allele Number', field: 'alleleNumber'},
                {display: 'Allele Frequency', field: 'alleleFrequency'},
            ],
            filterOpen: false
        };
    }

    filterClick() {
        this.setState({ filterOpen: true })

    }

    render() {
        const { filterMetadata } = this.props;
        const { filterCats, filterOpen } = this.state;
        return <div onClick={() => {
            this.filterClick();
        }} style={styles.filterBox}>
            {filterCats.map((cat, index) => {
                const key = 'cat' + index;
                return <div style={styles.filterItem} key={key}>
                    <span>{cat.display}</span>
                    <span><ClrIcon style={styles.filterItemHandleClosed} shape='angle' /></span>
                    {
                    // console.log(filterMetadata[cat.field.toString()],filterMetadata[cat.field.toString()].length,cat)
                    (filterOpen && filterMetadata && filterMetadata[cat.field.toString()].length)  && filterMetadata[cat.field.toString()].map((item: string,index)=>{
                        console.log(item,cat.display);
                        
                        return <div>test</div>
                    })
                    }
                </div>
            })
            }
            <div style={styles.actionBtnContainer}>
                <button style={styles.clearBtn}>Clear</button>
                <button style={styles.applyBtn}>Apply</button>
            </div>
        </div>
    }
}
