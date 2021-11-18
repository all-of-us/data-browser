import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { Variant, VariantListResponse } from 'publicGenerated';
import * as React from 'react';
import { VariantSearchComponent } from './variant-search.component';
import { VariantTableComponent } from './variant-table.component';

const styles = reactStyles({
    border: {
        background: 'white',
        borderRadius: '3px',
        padding: '2em',
        paddingTop: '1em',
        margin: '1em'
    },
    titleBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
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

interface Props {
    onSearchInput: Function;
    onPageChange: Function;
    variantListSize: number;
    loadingVariantListSize: boolean;
    loadingResults: boolean;
    searchResults: Variant[];
    currentPage: number;
    participantCount: string;
}

interface State {
    searchTerm: string;
}

export class GenomicSearchComponent extends React.Component<Props, State> {
    scrollDiv: any;
    constructor(props: Props) {
        super(props);
        this.scrollDiv = React.createRef();
        this.state = {
            searchTerm: null,
        }
    }

    handlePageChange(info) {
        this.props.onPageChange(info);
        this.scrollDiv.current.scrollIntoView({ behavior: 'smooth' });
    }

    render() {
        const { searchTerm } = this.state;
        const { currentPage, loadingResults, searchResults, variantListSize, loadingVariantListSize, onSearchInput, participantCount } = this.props;
        return <React.Fragment>
            <div style={styles.border}>
                <div style={styles.titleBox}>
                    <div style={styles.boxHeading} ref={this.scrollDiv}>Variant Search</div>
                    <div>{participantCount} participants</div>

                </div>
                <VariantSearchComponent
                    onSearchTerm={(searchTerm: string) => { onSearchInput(searchTerm); this.setState({ searchTerm: searchTerm }) }}
                    loading={loadingVariantListSize}
                    variantListSize={variantListSize} />
                <VariantTableComponent
                    loadingResults={loadingResults}
                    loadingVariantListSize={loadingVariantListSize}
                    variantListSize={variantListSize}
                    searchResults={searchResults}
                    searchTerm={searchTerm}
                    onPageChange={(info: any) => this.handlePageChange(info)}
                    currentPage={currentPage} />
            </div>
        </React.Fragment>;
    }
}
