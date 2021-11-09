import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicChartComponent } from './genomic-chart.component';

const styles = reactStyles({
    innerContainer: {
        padding: '1em'
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
    raceEthData: any;
    sexAtBirthData: any;
    currentAgeData: any;
    participantCounts: any[];
}

export class GenomicOverviewComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            participantCount: null,
            raceEthData: [],
            sexAtBirthData: [],
            currentAgeData: [],
            participantCounts : []
        }
    }
    getGenomicParticipantCounts() {
        return genomicsApi().getParticipantCounts().then(result => {
            // console.log(result);
        });
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
        this.getGenomicChartData();

    }
    getGenomicChartData() {
        return genomicsApi().getChartData().then(result => {
            console.log(result, 'rererereressulllt');

            // const raceEthArr: any[] = [], sexAtBirthArr: any[] = [], currentAgeArr: any[] = [];
            result.items.forEach(item => {
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
                participantCounts: this.participantCountsArr
            })
        });
    }


    render() {
        const { participantCount, raceEthData, sexAtBirthData, currentAgeData, participantCounts } = this.state;
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
                {raceEthData.length && <GenomicChartComponent counts={participantCounts} title='Race/ethnicity' data={raceEthData[0]} />}
                {sexAtBirthData.length && <GenomicChartComponent counts={participantCounts} title='Sex assigned at birth' data={sexAtBirthData[0]} />}
                {currentAgeData.length && <GenomicChartComponent counts={participantCounts} title='Current age' data={currentAgeData[0]} />}
            </div>
        </React.Fragment>;
    }
}
