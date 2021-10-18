import * as React from 'react';
import { reactStyles } from 'app/utils';
import { GenomicChartComponent } from './genomic-chart.component';

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



export class GenomicOverviewComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Genomic Overview</p>
                <GenomicChartComponent />
                <GenomicChartComponent />
                <GenomicChartComponent />
            </div>
        </React.Fragment>
    }
};
