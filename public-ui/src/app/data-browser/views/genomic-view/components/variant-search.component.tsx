import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { VariantFilterComponent } from 'app/data-browser/views/genomic-view/components/variant-filter.component';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { Spinner } from 'app/utils/spinner';
import { environment } from 'environments/environment';
import { GenomicFilters } from 'publicGenerated';
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
    },
    filterBtn: {
        fontFamily: 'gothamBold',
        color: '#216FB4',
        paddingBottom: '1rem',
        cursor: 'Pointer'

    },
    filterContainer: {
        position: 'relative'
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
    onFilterSubmit: Function;
    searchTerm: string;
    variantListSize: number;
    filterMetadata: GenomicFilters;
    loading: boolean;
}
interface State {
    searchWord: string;
    filterShow: boolean;
}

export class VariantSearchComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            searchWord: '',
            filterShow: false
        };
        if (this.state.searchWord !== '') {
            this.props.onSearchTerm(this.state.searchWord);
        }
    }

    handleChange(val: string) {
        this.setState({ searchWord: val });
        this.props.onSearchTerm(val);
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        const { searchTerm } = this.props;
        if (prevProps.searchTerm !== searchTerm) {
            this.setState({ searchWord: searchTerm });
        }
    }
    showFilter() {
        this.setState({ filterShow: !this.state.filterShow });
    }
    handleFilterSubmit(filteredMetadata: GenomicFilters) {
        this.props.onFilterSubmit(filteredMetadata);
    }

    render() {
        const { searchWord, filterShow } = this.state;
        const { variantListSize, loading, filterMetadata } = this.props;
        const variantListSizeDisplay = variantListSize ? variantListSize.toLocaleString() : 0;
        return <React.Fragment>
            <style>{css}</style>
            <div className='search-container'>
                <div style={styles.searchBar}>
                    <SearchComponent value={searchWord} searchTitle='' domain='genomics'
                        onChange={(val: string) => this.handleChange(val)}
                        onClear={() => this.handleChange('')} placeholderText='Search by gene, variant, or genomic region' />
                </div>
                <div style={styles.searchHelpText}>
                    Examples: <br></br>
                    <strong>Gene:</strong> BRCA2, <strong>Variant:</strong> 13-32355250-T-C, <br></br>
                    <strong>Genomic Region:</strong> chr13:32355000-32375000
                </div>
            </div>
            {(!loading && (variantListSize > 0) && environment.genoFilters) && <div onClick={() => this.showFilter()}
                style={styles.filterBtn}><ClrIcon shape='filter-2' /> Filter</div>}
            {variantListSize ? <strong style={styles.resultSize} >{!loading ? variantListSizeDisplay :
                <span style={styles.loading}><Spinner /></span>} variants found</strong> :
                <strong style={styles.resultSize} >{!loading ? variantListSizeDisplay : <span style={styles.loading}>
                    <Spinner /></span>} results</strong>}
            { environment.genoFilters && <div style={styles.filterContainer}>
                {(!loading && filterShow) && <VariantFilterComponent
                    filterMetadata={filterMetadata}
                    onFilterSubmit={(filteredMetadata) => this.handleFilterSubmit(filteredMetadata)} />}
            </div>
    }

        </React.Fragment>;
    }
}
