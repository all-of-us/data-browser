import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import _ from 'lodash';
import { Variant } from 'publicGenerated';
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

interface State {
    participantCount: number;
    loading: boolean;
    variantListSize: number;
    searchWord: string;
    searchResults: Variant[];
}



export class GenomicSearchComponent extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            participantCount: 0,
            loading: true,
            searchResults: null,
            variantListSize: 0,
            searchWord: ''
        };
    }

    search = _.debounce((searchTerm: string) => this.getVariantSearch(searchTerm), 1000);

    getGenomicParticipantCounts() {
        genomicsApi().getParticipantCounts().then(result => {
            const domainCountResult = result.results.filter(r => r.stratum4 === null)[0];
            this.setState({ participantCount: domainCountResult.countValue, loading: false });
        });
    }

    getSearchSize(searchTerm: string) {
        genomicsApi().getVariantSearchResultSize(searchTerm).then(
            result => {
                this.setState({
                    variantListSize: searchTerm !== '' ? result : 0,
                });
            }
        ).catch(e => {
            console.log(e, 'error');
        });
    }

    getVariantSearch(searchTerm: string) {
        if (searchTerm !== '') {
            genomicsApi().searchVariants(searchTerm).then(
                results => {
                    this.setState({
                        searchResults: results.items
                    });
                }
            );
        } else {
            this.setState({
                searchResults: null
            });
        }
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
    }


    render() {
        const { loading, participantCount, searchResults, variantListSize } = this.state;
        return <React.Fragment>
            {!loading &&
                <div style={styles.border}>
                    <div style={styles.titleBox}><div style={styles.boxHeading}>Variant Search</div><div style={styles.boxHeading}>
                        {participantCount.toLocaleString()} participants</div></div>
                    <VariantSearchComponent variantListSize={variantListSize}
                        searchTerm={(searchTerm: string) => { this.search(searchTerm); this.getSearchSize(searchTerm); }}/>
                    <VariantTableComponent variantListSize={variantListSize} searchResults={searchResults} />
                </div>}
        </React.Fragment>;
    }
}
