import { withRouteData } from 'app/components/app-router';
import { GenomicOverviewComponent } from 'app/data-browser/views/genomic-view/components/genomic-overview.component';
import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { globalStyles } from 'app/utils/global-styles';
import _ from 'lodash';
import { Variant } from 'publicGenerated';
import * as React from 'react';
import { GenomicFaqComponent } from './components/genomic-faq.component';
import { GenomicSearchComponent } from './components/genomic-search.component';

const styles = reactStyles({
    title: {
        margin: '0'
    },
    viewLayout: {
        display: 'grid',
        gridTemplateColumns: '185px 85%',
        columnGap: '0.5rem',
        marginTop: '1em'
    },
    sideBarLayout: {
        color: '#0079b8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    },
    sideBarItemConainer: {
        paddingBottom: '.25rem',
        borderBottom: '1px solid rgba(38, 34, 98, .25)',
        width: '100%'
    },
    sideBarItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        paddingBottom: '0',
        fontSize: '0.8em',
        width: '100%',
        cursor: 'pointer',
        margin: '0.5rem'
    },
    sideBarItemText: {
        width: '75%'
    },
    sideBarItemSelected: {
        background: 'red',
        borderRadius: '3px',
        fontFamily: 'GothamBold, Arial, Helvetica, sans-serif',
        fontWeight: 'bolder',
        backgroundColor: 'rgba(33,111,180,0.15)'
    },
    faqHeading: {
        fontSize: '0.8em',
        color: 'rgb(38, 34, 98)',
        align: 'center',
        padding: '0.5rem',
        margin: '0.5rem',
        marginTop: '2em',
    },
    faqLink: {
        color: '#0079b8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    }
});

interface State {
    selectionId: number;
    previousId: number;
    searchResults: Variant[];
    loadingResults: boolean;
    variantListSize: number;
    loadingVariantListSize: boolean;
    searchTerm: string;
    currentPage: number;
    participantCount: string;
    chartData: any;
}

const css = `
`;

export const GenomicViewComponent = withRouteData(class extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            selectionId: 2,
            previousId: null,
            searchResults: [],
            loadingResults: null,
            variantListSize: null,
            loadingVariantListSize: null,
            searchTerm: '',
            currentPage: null,
            participantCount: null,
            chartData: null
        };
    }

    sideBarItems = [
        {
            id: 1,
            label: 'Participant Demographics'
        },
        {
            id: 2,
            label: 'Variant Search'
        }
    ];
    title = 'Genomic Data';

    search = _.debounce((searchTerm: string) => this.getVariantSearch(searchTerm), 1000);

    getSearchSize(searchTerm: string) {
        this.setState({ loadingVariantListSize: true });
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

    getVariantSearch(searchTerm) {
        this.getSearchSize(searchTerm);
        this.setState({ loadingResults: true });
        if (searchTerm !== '') {
            genomicsApi().searchVariants(searchTerm).then(
                results => {
                    console.log(results,'results');
                    
                    this.setState({
                        searchResults: results.items,
                        loadingResults: false
                    });
                }
            );
        } else {
            this.setState({
                searchResults: null,
                loadingResults: false
            });
        }
    }

    getGenomicParticipantCounts() {
        genomicsApi().getParticipantCounts().then((results) => {
            results.results.forEach(type => {
                if (type.stratum4 === null) {
                    this.setState({
                        participantCount: type.countValue.toLocaleString()
                    });
                }
            });
        });
    }

    getGenomicChartData() {
        return genomicsApi().getChartData().then(results => {
            this.setState({ chartData: results.items });
        });
    }

    handlePageChange(info) {
        this.setState({ loadingResults: true });
        genomicsApi().searchVariants(info.searchTerm, info.selectedPage + 1).then(
            results => {
                this.setState({
                    searchResults: results.items,
                    loadingResults: false,
                    currentPage: info.selectedPage
                });
            }
        );
    }

    sideBarClick(selected: number) {
        this.setState({
            selectionId: selected,
            previousId: this.state.selectionId
        });
    }

    handleFaqClose() {
        this.setState({ selectionId: this.state.previousId });
    }

    handleSearchTerm(searchTerm: string) {
        console.log(this.state.searchTerm, searchTerm);
        if (this.state.searchTerm !== searchTerm) {
            this.search(searchTerm);
        }
    }

    componentDidMount() {
        this.getGenomicParticipantCounts();
        this.getGenomicChartData();
    }

    componentWillUnmount() {
        localStorage.setItem('genomicSearchText', '');
    }

    render() {
        const { currentPage,
            selectionId,
            loadingVariantListSize,
            variantListSize,
            loadingResults,
            searchResults,
            participantCount,
            chartData } = this.state;
        return <React.Fragment>
            <style>{css}</style>
            <div id='genomicView'>
                <div id='genomicTitle'>
                    <h1 style={styles.title}>{this.title}</h1>
                    <p style={globalStyles.bodyDefault}>
                        This section provides an overview of genomic data within the current
                        <i> All of Us</i> dataset.Researchers can use the Participants with Genomic
                        Data page to view currently available genomic data by participant - reported
                        for preliminary exploration of genetic variant allele frequencies by with select
                        annotations and genetic ancestry associations.
                    </p>
                </div>
                <div style={styles.viewLayout}>
                    <div style={styles.sideBarLayout} id='sideBar'>
                        {this.sideBarItems.map((item, index) => {
                            return <div key={index} style={styles.sideBarItemConainer}>
                                <div onClick={() => this.sideBarClick(item.id)}
                                    style={{ ...selectionId === item.id && { ...styles.sideBarItemSelected }, ...styles.sideBarItem }}>
                                    <span style={styles.sideBarItemText}>
                                        {item.label}
                                    </span>
                                </div>
                            </div>;
                        })
                        }
                        <div style={styles.faqHeading}>Questions about genomics?<br /><div style={styles.faqLink}
                            onClick={() => this.sideBarClick(3)}>Learn More</div></div>
                    </div>
                    <div id='childView'>
                        {selectionId === 1 &&
                            <GenomicOverviewComponent
                                participantCount={participantCount}
                                chartData={chartData}
                            />}
                        {selectionId === 2 &&
                            <GenomicSearchComponent
                                onSearchInput={(searchTerm: string) => {
                                    this.handleSearchTerm(searchTerm);
                                    this.setState({ searchTerm: searchTerm });
                                }}
                                onPageChange={(info) => { this.handlePageChange(info); }}
                                currentPage={currentPage}
                                variantListSize={variantListSize}
                                loadingVariantListSize={loadingVariantListSize}
                                loadingResults={loadingResults}
                                searchResults={searchResults}
                                participantCount={participantCount} />}
                        {selectionId === 3 &&
                            <GenomicFaqComponent closed={() => this.handleFaqClose()} />}
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
});
