import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { VariantInfo,Variant } from 'publicGenerated';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

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
        padding: '.5em'
    },
    top: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        width: '100%',
        margin: '0',
        paddingBottom: '.5rem',


    },
    title: {
        fontSize: '1em',

    },
    body: {
        display: 'grid',
        gridTemplateColumns:'25% 25% 25% 25%',
        columnGap:'1rem',
        rowGap:'1rem'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {
    closed: Function;
    variant: Variant;
    variantDetails: VariantInfo;
}
// tslint:disable-next-line:no-empty-interface
interface State {

}

export class VariantExpandedComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { variantDetails,variant } = this.props;
        return <React.Fragment>
            <style>{css}</style>
            <div style={styles.variantExpanded}>
                <div style={styles.top}>
                    <span style={styles.title}><strong>Variant ID:</strong> {variantDetails && variantDetails.variantId} </span>
                    <div ><ClrIcon onClick={(e) => this.props.closed()} className="exit" size="xl" shape='window-close' /></div>
                </div>
                {(variantDetails && variant) && <div style={styles.body}>
                     <div>
                        <span>Consequence:</span><br/>
                        <span>{variant.consequence}</span>
                    </div>
                    <div>
                        <span>Protein Change:</span><br/>
                        <span>{variant.proteinChange}:</span>
                    </div>
                    <div>
                        <span>DNA Change:</span><br/>
                        <span>{variantDetails.dnaChange}</span>
                    </div>
                    <div>
                        <span>Transcript:</span><br/>
                        <span>{variantDetails.transcript}</span>
                    </div>
                    <div>
                        <span>RS Number:</span><br/>
                        <span>{variantDetails.rsNumber}</span>
                    </div>
                    <div>
                        <span>Gene:</span><br/>
                        <span>{variant.genes}</span>
                    </div>
                    <div>
                        <span>Clinical Significance:</span><br/>
                        <span>{variant.clinicalSignificance}</span>
                    </div>
                </div>}
            </div>
        </React.Fragment>;
    }
}
