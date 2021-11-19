import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicChartComponent } from './genomic-chart.component';

const styles = reactStyles({
    innerContainer: {
        background: 'white',
        margin: '1em',
        padding: '2em',
        paddingTop: '1em',
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
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    }

});
interface Props {
    participantCount: string;
    chartData: any[];
}
interface State {
    loading: boolean;
    raceEthData: any;
    sexAtBirthData: any;
    currentAgeData: any;
    participantCounts: any[];
}

export class GenomicOverviewComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            raceEthData: [],
            sexAtBirthData: [],
            currentAgeData: [],
            participantCounts: []
        };
    }

    raceEthArr: any[] = [];
    sexAtBirthArr: any[] = [];
    currentAgeArr: any[] = [];
    participantCountsArr: any[] = [];

    componentDidMount() {
        //{ this.props.chartData && this.getGenomicChartData(); }
        this.getGenomicChartData();
    }

    getGenomicChartData() {
        this.props.chartData.forEach(item => {
            switch (item.analysisId) {
                case 3503:
                    this.raceEthArr.push(item);
                    break;
                case 3501:
                    this.sexAtBirthArr.push(item);
                    break;
                case 3502:
                    this.currentAgeArr.push(item);
                    break;
                case 3000:
                    this.participantCountsArr.push(item);
            }
        });
        this.setState({
            raceEthData: this.raceEthArr,
            sexAtBirthData: this.sexAtBirthArr,
            currentAgeData: this.currentAgeArr,
            participantCounts: this.participantCountsArr,
            loading: false
        });
    }

    render() {
        const { raceEthData, sexAtBirthData, currentAgeData, participantCounts, loading } = this.state;
        const { participantCount } = this.props;
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
                {!loading && <React.Fragment>
                    <GenomicChartComponent counts={participantCounts[0]} title='Race/ethnicity' data={raceEthData[0]} />
                    <GenomicChartComponent counts={participantCounts[0]} title='Sex assigned at birth' data={sexAtBirthData[0]} />
                    <GenomicChartComponent counts={participantCounts[0]} title='Current age' data={currentAgeData[0]} />
                </React.Fragment>}
            </div>
        </React.Fragment>;
    }
}
