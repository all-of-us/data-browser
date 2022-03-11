import { reactStyles } from 'app/utils';
import { Variant } from 'publicGenerated';
import * as React from 'react';
import { VariantSearchComponent } from './variant-search.component';
import { VariantTableComponent } from './variant-table.component';

const styles = reactStyles({
    border: {
        background: 'white',
        padding: '2em',
        paddingTop: '1em',
    },
    titleBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    boxHeading: {
        margin: 0,
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontWeight: 100,
        fontStyle: 'normal',
        fontSize: '.8em',
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
    onRowCountChange: Function;
    onSortClick: Function;
    variantListSize: number;
    loadingVariantListSize: boolean;
    loadingResults: boolean;
    searchResults: Variant[];
    currentPage: number;
    rowCount: number;
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
        };
    }

    handlePageChange(info) {
        this.props.onPageChange(info);
        this.scrollDiv.current.scrollIntoView({ behavior: 'smooth' });
    }

    handleRowCountChange(info) {
        this.props.onRowCountChange(info);
        this.scrollDiv.current.scrollIntoView({ behavior: 'smooth' });
    }

    handleSortClick(sortMetadata) {
        this.props.onSortClick(sortMetadata);
    }

    render() {
        const { searchTerm } = this.state;
        const { currentPage, loadingResults, searchResults, variantListSize, loadingVariantListSize, onSearchInput,
        rowCount} = this.props;
        return <React.Fragment>
            <div style={styles.titleBox}>
                <p style={styles.boxHeading} ref={this.scrollDiv}>
                    Use the Variant Search to explore allele frequencies for a gene or genomic region. Drill down into
                    specific variants to view select annotations and genetic ancestry associations. </p>
                </div>
                <VariantSearchComponent
                    onSearchTerm={(searchWord: string) => { onSearchInput(searchWord); this.setState({ searchTerm: searchWord }); }}
                    loading={loadingVariantListSize}
                    searchTerm={searchTerm}
                    variantListSize={variantListSize} />
                <VariantTableComponent
                    loadingResults={loadingResults}
                    loadingVariantListSize={loadingVariantListSize}
                    variantListSize={variantListSize}
                    searchResults={searchResults}
                    searchTerm={searchTerm}
                    onSearchTerm={(searchWord: string) => { onSearchInput(searchWord); this.setState({ searchTerm: searchWord }); }}
                    onRowCountChange={(info: any) => this.handleRowCountChange(info)}
                    onPageChange={(info: any) => this.handlePageChange(info)}
                    onSortClick={(sortMetadata: any) => this.handleSortClick(sortMetadata)}
                    currentPage={currentPage}
                    rowCount={rowCount}/>
        </React.Fragment>;
    }
}
