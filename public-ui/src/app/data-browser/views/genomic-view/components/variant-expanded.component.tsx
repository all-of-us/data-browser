import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { VariantInfo } from 'publicGenerated';
import * as React from 'react';


const styles = reactStyles({
    top: {
        position: 'relative',
        borderBottom: '1px solid',
        width: '100%',
        margin: '0',
        padding:'1rem',
        

    },
    variantExpanded: {
        position: 'sticky',
        width: '100%',
        background: '#ECF1F4',
        top: '0px',
        left: '0px',
        padding:'.5em'
    },
    exit: {
        position: 'absolute',
        top: '0',
        right: '0'
    },
    title :{
        fontSize: '1em',

    }
});


// tslint:disable-next-line:no-empty-interface
interface Props {
    closed: Function;
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
       const {variantDetails}= this.props;
        return <React.Fragment>
            <div style={styles.variantExpanded}>
                <div style={styles.top}>
                    {variantDetails && <span style={styles.title}>Variant ID: {variantDetails.variantId} </span>}
                    <div onClick={(e) => this.props.closed()} style={styles.exit}>X</div>
                </div>
            </div>
        </React.Fragment>;
    }
}
