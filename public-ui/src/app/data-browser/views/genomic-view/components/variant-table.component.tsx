import { reactStyles } from 'app/utils';
import * as React from 'react';
import { VariantRowComponent } from './variant-row.component';

const styles = reactStyles({
    border: {
        border: '1px solid',
        margin: '1rem'
    }
});


// tslint:disable-next-line:no-empty-interface
interface Props {

}
// tslint:disable-next-line:no-empty-interface
interface State {

}



export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Variant Table</p>
                <VariantRowComponent />
            </div>
        </React.Fragment>;
    }
}
