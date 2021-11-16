import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';

const styles = reactStyles({
    searchContainer: {
        paddingTop: '1em',
        paddingBottom: '1em',
        display: 'flex',
        flexDirection: 'row'
    },
    searchBar: {
        paddingRight: '2rem'
    },
    searchHelpText: {
        paddingTop: '2em',
        lineHeight: '1.3em',
        fontSize: '0.75em'
    },
    loading: {
        transform: 'scale(.3)',
        marginLeft: '-0.5rem',
        width: '2rem'
    },
    resultSize: {
        display: 'flex',
        alignItems: 'center',
        height: '1rem'
    }
});

interface Props {
    onSearchTerm: Function;
    variantListSize: number;
    loading: boolean;
}
interface State {
    searchWord: string;
}

export class VariantSearchComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            searchWord: localStorage.getItem('genomicSearchText') ? localStorage.getItem('genomicSearchText') : '',
        };
        if (this.state.searchWord !== '') {
            this.props.onSearchTerm(this.state.searchWord);
        }
    }

    handleChange(val: string) {
        if (val !== '') {
            localStorage.setItem('genomicSearchText', val);
        } else {
            localStorage.removeItem('genomicSearchText');
        }
        this.props.onSearchTerm(val);
        this.setState({ searchWord: val });
    }

    render() {
        const { searchWord } = this.state;
        const { variantListSize, loading } = this.props;
        const variantListSizeDisplay = variantListSize && variantListSize.toLocaleString();
        
        return <React.Fragment>
            <div style={styles.searchContainer}>
                <div style={styles.searchBar}>
                    <SearchComponent value={searchWord} searchTitle='' domain='genomics'
                        onChange={(val: string) => this.handleChange(val)}
                        onClear={() => this.handleChange('')} />
                </div>
                <div style={styles.searchHelpText}>
                    Examples: <br></br>
                    Gene: TP53, Variant: 17-7577097-C-T, <br></br>
                    Genomic Region: chr17:7572855-7579987
                </div>
            </div>
            {variantListSize ? <strong style={styles.resultSize} >{!loading ? variantListSizeDisplay :
            <span style={styles.loading}><Spinner /></span>} variants found</strong> :
                <strong style={styles.resultSize} >{!loading ? variantListSizeDisplay : <span style={styles.loading}>
                <Spinner /></span> } results</strong>}
        </React.Fragment>;
    }
}
