import { reactStyles } from 'app/utils';
import * as React from 'react';
import { VariantExpandedComponent } from './variant-expanded.component';


const styles = reactStyles({
    border: {
        border: '1px solid'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {

}
// tslint:disable-next-line:no-empty-interface
interface State {

}



export class VariantRowComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Variant Row</p>
                <VariantExpandedComponent />
            </div>
        </React.Fragment>;
    }
}
