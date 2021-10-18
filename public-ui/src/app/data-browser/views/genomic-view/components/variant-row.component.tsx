import * as React from 'react';
import { reactStyles } from 'app/utils';
import { VariantExpandedComponent } from './variant-expanded.component';


const styles = reactStyles({
    border: {
        border: '1px solid',
        margin: '1rem'
    }
})


interface Props {

}

interface State {

}



export class VariantRowComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Variant Row</p>
                <VariantExpandedComponent />
            </div>
        </React.Fragment>
    }
};
