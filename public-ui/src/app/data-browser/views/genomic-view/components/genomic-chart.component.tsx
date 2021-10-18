import { reactStyles } from 'app/utils';
import * as React from 'react';

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



export class GenomicChartComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Genomic Chart</p>
            </div>
        </React.Fragment>;
    }
}
