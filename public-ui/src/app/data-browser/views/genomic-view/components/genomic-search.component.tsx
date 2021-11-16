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
    constructor(props: Props) {
        super(props);
    }


    handleResults(results: VariantListResponse) {
        this.setState({
            searchResults: results.items
        });
    }

    render() {
        const { onSearchInput, variantListSize, loadingVariantListSize, searchResults, loadingResults } = this.props;
        return <React.Fragment>
            <div style={styles.border}>
                <div style={styles.titleBox}><div style={styles.boxHeading}>Variant Search</div></div>
                <VariantSearchComponent loading={loadingVariantListSize} variantListSize={variantListSize}
                    searchTerm={(searchTerm: string) => { onSearchInput(searchTerm) }} />
                <VariantTableComponent loading={loadingResults} variantListSize={variantListSize} searchResults={searchResults} />
            </div>
        </React.Fragment>;
    }
}
