import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { VariantSearchComponent } from './variant-search.component';
import { VariantTableComponent } from './variant-table.component';

const styles = reactStyles({
    border: {
        background: 'white',
        borderRadius: '3px',
        padding: '2rem',
        paddingTop: '1em',
    },
    titleBox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    boxHeading: {
        fontFamily: 'Arial, sans-serif',
        fontWeight: 200,
        fontStyle: 'normal',
        fontSize: '27px',
        fontStretch: 'normal',
        lineHeight: '1.47em',
        letterSpacing: 'normal',
        textAlign: 'left',
        color: '#262262'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {

}
// tslint:disable-next-line:no-empty-interface
interface State {
    participantCount: number;
    loading: boolean;
    searchResults: any[];
}



export class GenomicSearchComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            participantCount: 0,
            loading: true,
            searchResults: null
        };
    }

    getGenomicParticipantCounts() {
        genomicsApi().getParticipantCounts().then(result => {
            const domainCountResult = result.results.filter(r => r.stratum4 === null)[0];
            this.setState({ participantCount: domainCountResult.countValue, loading: false });
        });
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
    }

    handleResults(results: any) {
        console.log(results.items, 'frerere');

        this.setState({
            searchResults: results.items
        });
    }

    render() {
        const { loading, participantCount, searchResults } = this.state;
        return <React.Fragment>
            {!loading &&
                <div style={styles.border}>
                    <div style={styles.titleBox}><div style={styles.boxHeading}>Variant Search</div><div style={styles.boxHeading}>
                        {participantCount.toLocaleString()} participants</div></div>
                    <VariantSearchComponent onSearchReturn={(results: any[]) => this.handleResults(results)} />
                    <VariantTableComponent searchResults={searchResults} />
                </div>}
        </React.Fragment>;
    }
}
