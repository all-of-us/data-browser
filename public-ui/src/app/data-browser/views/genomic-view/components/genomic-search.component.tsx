import { reactStyles } from 'app/utils';
import * as React from 'react';
import { VariantSearchComponent } from './variant-search.component';
import { VariantTableComponent } from './variant-table.component';

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



export class GenomicSearchComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Genomic Search</p>
                <VariantSearchComponent />
                <VariantTableComponent />
            </div>
        </React.Fragment>;
    }
}
