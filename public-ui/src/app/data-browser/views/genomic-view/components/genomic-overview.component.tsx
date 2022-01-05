import { AGE_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicChartComponent } from './genomic-chart.component';

const styles = reactStyles({
    innerContainer: {
        background: 'white',
        marginLeft: '1em',
        marginRight: '1em',
        marginBottom: '1em',
        marginTop: '0.5em',
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
        // { this.props.chartData && this.getGenomicChartData(); }
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
        if (this.currentAgeArr && this.currentAgeArr[0]) {
            this.currentAgeArr[0].results.map(o => {o.analysisStratumName = o.stratum2});
            this.currentAgeArr[0].results.sort((a, b) =>
                (a.analysisStratumName > b.analysisStratumName) - (a.analysisStratumName < b.analysisStratumName));
        }
        this.setState({
            raceEthData: (this.raceEthArr && this.raceEthArr[0]) ? this.raceEthArr[0] : null,
            sexAtBirthData: (this.sexAtBirthArr && this.sexAtBirthArr[0]) ? this.sexAtBirthArr[0] : null,
            currentAgeData: (this.currentAgeArr && this.currentAgeArr[0]) ? this.currentAgeArr[0] : null,
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
                    <GenomicChartComponent counts={participantCounts[0]} title='Race/ethnicity' data={raceEthData} />
                    <GenomicChartComponent counts={participantCounts[0]} title='Sex assigned at birth' data={sexAtBirthData} />
                    <GenomicChartComponent counts={participantCounts[0]} title='Current age' data={currentAgeData} />
                </React.Fragment>}
            </div>
        </React.Fragment>;
    }
}
