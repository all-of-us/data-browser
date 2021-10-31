import { reactStyles } from 'app/utils';
import * as React from 'react';
import { VariantExpandedComponent } from './variant-expanded.component';

import { Variant } from 'publicGenerated';


const styles = reactStyles({
    rowLayout: {
        display: 'grid',
        gridTemplateColumns: '10rem 10rem 15rem 13rem 10rem 10rem 10rem 10rem',
        width: '89rem',
        // padding: '0.5rem',
        background: 'white',
        fontSize: '.8em',
        borderBottom: '1px solid #CCCCCC'
    },
    variant: {
        border:'red solid 1px'
    },
    rowItem:{
        paddingTop:'.5rem',
        paddingBottom:'.5rem',
    },
    first: {
        paddingLeft:'.5rem'
    },
    last: {
        paddingRight:'.5rem'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {
    varData: Variant
}
// tslint:disable-next-line:no-empty-interface
interface State {

}



export class VariantRowComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    checkWidth(event) {
        console.log(event.target.clientWidth, 'loaded');

    }

    render() {
        const { varData } = this.props;
        return <React.Fragment>
            <div style={styles.rowLayout}>
                <div style={{...styles.variant,...styles.first,...styles.rowItem}}>{varData.variantId}</div>
                <div style={styles.rowItem}>{varData.genes}</div>
                <div style={styles.rowItem}>
                    {varData.consequence.length ? varData.consequence.map((item, index) => {
                        return <div key={index}>{item}<br /></div>
                    }) : <div>–</div>}
                </div>
                {varData.proteinChange ? <div  style={{overflowWrap: 'anywhere',...styles.rowItem}}>{varData.proteinChange}</div> : <div>–</div>}
                <div style={styles.rowItem}>
                    {varData.clinicalSignificance.length ? varData.clinicalSignificance.map((item, index) => {
                        return <div key={index}>{item}<br /></div>
                    }) : <div>–</div>}
                </div>
                <div style={styles.rowItem}>{varData.alleleCount}</div>
                <div style={styles.rowItem}>{varData.alleleNumber}</div>
                <div style={styles.rowItem}>{varData.alleleFrequency}</div>

            </div>
            {/* <VariantExpandedComponent /> */}
        </React.Fragment>;
    }
}









