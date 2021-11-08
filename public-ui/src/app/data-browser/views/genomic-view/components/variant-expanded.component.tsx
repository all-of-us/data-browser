import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { Variant, VariantInfo } from 'publicGenerated';
import * as React from 'react';
import { Spinner } from 'app/utils/spinner';

const css = `
.exit{
    width:2rem;
    height:2rem;
    color:#216FB4;
}
`;

const styles = reactStyles({
    variantExpanded: {
        position: 'sticky',
        width: '100%',
        background: '#ECF1F4',
        top: '0px',
        left: '0px',
        padding: '.5em',
        paddingLeft: '1em',
        borderTop: '1px solid rgb(204, 204, 204)'
    },
    top: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #979797',
        width: '100%',
        margin: '0',
        paddingBottom: '.5rem',
    },
    variantId: {
        fontSize: '18px',
        display: 'flex',
        alignItems:'center'
        
    },
    body: {
        display: 'grid',
        gridTemplateColumns: '25% 25% 25% 25%',
        columnGap: '1rem',
        rowGap: '1rem',
        paddingTop: '1rem',
        fontSize: '14px',
        width: '75%'
    },
    catHeading: {
        fontFamily: 'gothamBold,Arial, Helvetica, sans-serif'
    },
    catInfo: {
        overflowWrap: 'anywhere'
    },
    loading: {
        transform: 'scale(.5)'
    }
});

interface Props {
    closed: Function;
    variant: Variant;
    variantDetails: VariantInfo;
    loading: boolean;
}
// tslint:disable-next-line:no-empty-interface
interface State {

}

export class VariantExpandedComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { variantDetails, variant, loading } = this.props;
        return <React.Fragment>
            <style>{css}</style>
            <div style={styles.variantExpanded}>
                <div style={styles.top}>
                    <span style={styles.variantId}><strong>Variant ID: </strong> {!loading ? <span style={{paddingLeft:'1em'}}> {variant.variantId}</span> : <div style={styles.loading}><Spinner /></div>} </span>
                    <div ><ClrIcon onClick={(e) => this.props.closed()} className='exit' shape='window-close' /></div>
                </div>
                {!loading && <div style={styles.body}>
                    <div>
                        <span style={styles.catHeading}>Consequence:</span><br />
                        <span style={styles.catInfo}>{variant.consequence}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Protein Change:</span><br />
                        <span style={styles.catInfo}>{variant.proteinChange}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>DNA Change:</span><br />
                        <span style={styles.catInfo}>{variantDetails.dnaChange}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Transcript:</span><br />
                        <span style={styles.catInfo}>{variantDetails.transcript}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>RS Number:</span><br />
                        <span style={styles.catInfo}>{variantDetails.rsNumber}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Gene:</span><br />
                        <span style={styles.catInfo}>{variant.genes}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Clinical Significance:</span><br />
                        <span style={styles.catInfo}>{variant.clinicalSignificance}</span>
                    </div>
                </div>}
            </div>
        </React.Fragment>;
    }
}
