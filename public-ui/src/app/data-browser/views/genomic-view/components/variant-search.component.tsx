import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';

const styles = reactStyles({
    searchBar: {
        paddingRight: '2rem',
        width: '35em'
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

const css = `
.search-container {
    padding-top: 1em;
    padding-bottom: 1em;
    display: flex;
    align-items: flex-end;
    flex-direction: row;
}
@media (max-width: 1096px) {
    .search-container {
        flex-direction: column;
        align-items: flex-start;
    }
}
`;

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
        this.setState({ searchWord: val });
        this.props.onSearchTerm(val);
    }

    render() {
        const { searchWord } = this.state;
        const { variantListSize, loading } = this.props;
        const variantListSizeDisplay = variantListSize ? variantListSize.toLocaleString() : 0;
        return <React.Fragment>
            <style>{css}</style>
            <div className='search-container'>
                <div style={styles.searchBar}>
                    <SearchComponent value={searchWord} searchTitle='' domain='genomics'
                        onChange={(val: string) => this.handleChange(val)}
                        onClear={() => this.handleChange('')} placeholderText='Search by gene, variant, or genomic region'/>
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
