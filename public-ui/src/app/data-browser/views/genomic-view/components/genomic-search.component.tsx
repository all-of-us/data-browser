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

interface Props {
    onSearchInput: Function;
    variantListSize: number;
    loadingVariantListSize: boolean;
    loadingResults: boolean;
    searchResults: Variant[];
}

interface State {

}

export class GenomicSearchComponent extends React.Component<Props, State> {
    scrollDiv: any;
    constructor(props: Props) {
        super(props);
        this.scrollDiv = React.createRef();
    }


    handleResults(results: VariantListResponse) {
        this.setState({
            searchResults: results.items
        });
    }

    handlePageChange() {
        this.scrollDiv.current.scrollIntoView({ behavior: 'smooth' });
    }

    render() {
        let searchTerm: string;
        const { loadingResults, searchResults, variantListSize, loadingVariantListSize, onSearchInput } = this.props;
        return <React.Fragment>
            <div style={styles.border}>
                <div style={styles.titleBox}><div style={styles.boxHeading} ref={this.scrollDiv}>Variant Search</div></div>
                <VariantSearchComponent
                    onSearchTerm={(searchTerm: string) => { onSearchInput(searchTerm); searchTerm = searchTerm; }}
                    loading={loadingVariantListSize}
                    variantListSize={variantListSize} />
                <VariantTableComponent
                    loading={loadingResults}
                    variantListSize={variantListSize}
                    searchResults={searchResults}
                    searchTerm={searchTerm}
                    onPageChange={() => this.handlePageChange()} />
            </div>
        </React.Fragment>;
    }
}
