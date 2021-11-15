import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicChartComponent } from './genomic-chart.component';

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



export class GenomicOverviewComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }
    getGenomicParticipantCounts() {
        return genomicsApi().getParticipantCounts().then(result => {
            // console.log(result);
        });
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
    }

    render() {
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Genomic Overview</p>
                <GenomicChartComponent />
                <GenomicChartComponent />
                <GenomicChartComponent />
            </div>
        </React.Fragment>;
    }
}
