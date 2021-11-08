import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import _ from 'lodash';
import { Variant, VariantListResponse } from 'publicGenerated';
import * as React from 'react';
import { VariantSearchComponent } from './variant-search.component';
import { VariantTableComponent } from './variant-table.component';

const styles = reactStyles({
    border: {
        background: 'white',
        borderRadius: '3px',
        padding: '2rem',
        paddingTop: '1em'
    },
    titleBox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    boxHeading: {
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontWeight: 100,
        fontStyle: 'normal',
        fontSize: '1.3em',
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
    loadingVariantListSize: boolean;
    variantListSize: number;
    searchWord: string;
    searchResults: Variant[];
}

export class GenomicSearchComponent extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            participantCount: 0,
            loading: null,
            loadingVariantListSize: null,
            searchResults: null,
            variantListSize: 0,
            searchWord: ''
        };
    }

    search = _.debounce((searchTerm: string) => this.getVariantSearch(searchTerm), 1000);

    getGenomicParticipantCounts() {
        genomicsApi().getParticipantCounts().then(result => {
            const domainCountResult = result.results.filter(r => r.stratum4 === null)[0];
            this.setState({ participantCount: domainCountResult.countValue });
        });
    }

    getSearchSize(searchTerm: string) {
        this.setState({loadingVariantListSize: true})
        genomicsApi().getVariantSearchResultSize(searchTerm).then(
            result => {
                this.setState({
                    variantListSize: searchTerm !== '' ? result : 0,
                    loadingVariantListSize: false
                });
            }
        ).catch(e => {
            console.log(e, 'error');
        });
    }

    getVariantSearch(searchTerm: string) {
        this.setState({loading:true})
        if (searchTerm !== '') {
            genomicsApi().searchVariants(searchTerm).then(
                results => {
                    this.setState({
                        searchResults: results.items,
                        loading: false
                    });
                }
            );
        } else {
            this.setState({
                searchResults: null,
                loading: false
            });
        }
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
    }

    handleResults(results: VariantListResponse) {
        this.setState({
            searchResults: results.items
        });
    }

    render() {
        const { loading, participantCount, searchResults, variantListSize,loadingVariantListSize } = this.state;
        return <React.Fragment>
                <div style={styles.border}>
                    <div style={styles.titleBox}><div style={styles.boxHeading}>Variant Search</div><div style={styles.boxHeading}>
                        {participantCount.toLocaleString()} participants</div></div>
                    <VariantSearchComponent loading={loadingVariantListSize} variantListSize={variantListSize}
                        searchTerm={(searchTerm: string) => { this.search(searchTerm); this.getSearchSize(searchTerm); }}
                        onSearchReturn={(results: VariantListResponse) => this.handleResults(results)} />
                    <VariantTableComponent loading={loading} variantListSize={variantListSize} searchResults={searchResults} />
                </div>
        </React.Fragment>;
    }
}
