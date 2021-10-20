import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicChartComponent } from './genomic-chart.component';

const styles = reactStyles({
    innerContainer: {
        padding:'1em'
    },
    title: {
        margin: '0',

    },
    desc: {
        color: '#302C71',
        margin: '0',
        padding: '1em',
        paddingLeft: '0',
        fontSize: '.8em'
    },
    headingLayout: {
        display: 'flex',
        justifyContent: 'space-between'
    }

});

// tslint:disable-next-line:no-empty-interface
interface Props {

}
// tslint:disable-next-line:no-empty-interface
interface State {
    participantCount: string;
}

export class GenomicOverviewComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            participantCount: null
        }
    }
    async getGenomicParticipantCounts() {
        const result_1 = await genomicsApi().getParticipantCounts();
        result_1.results.forEach(type => {
            if (type.stratum4 === null) {
                this.setState({
                    participantCount: type.countValue.toLocaleString()
                });
            }
        });
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
    }
    getGenomicParticipantCounts() {
        return genomicsApi().getParticipantCounts().then(result => {
            console.log(result);

        });
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
    }

    render() {
        const { participantCount } = this.state;
        return <React.Fragment>
            <div style={styles.innerContainer}>
                <div style={styles.headingLayout}>
                    <div>
                        <h3 style={styles.title}>Participant Demographics</h3>
                        <p style={styles.desc}>Demographic data is self-reported by participants</p>
                    </div>
                    <div>
                        <span>{participantCount} participants</span>
                    </div>
                </div>
                <GenomicChartComponent />
                <GenomicChartComponent />
                <GenomicChartComponent />
            </div>
        </React.Fragment>;
    }
}
