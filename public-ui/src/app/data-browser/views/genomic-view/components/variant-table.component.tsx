import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import { Variant } from 'publicGenerated';
import * as React from 'react';
import ReactPaginate from 'react-paginate';
import { VariantRowComponent } from './variant-row.component';

const styles = reactStyles({
    tableContainer: {
        borderTop: '1px solid #CCCCCC',
        borderLeft: '1px solid #CCCCCC',
        borderRight: '1px solid #CCCCCC',
        borderBottom: 'none',
        borderRadius: '3px 3px 0 0',
        background: '#FAFAFA',
        marginTop: '0.5rem',
        overflowX: 'scroll',
        overflowY: 'hidden'
    },
    tableFrame: {
        border: '1px solid #CCCCCC',
        borderRadius: '3px',
        background: '#FAFAFA',
        marginTop: '0.5rem',
        height: '25rem'
    },
    headerLayout: {
        display: 'grid',
        gridTemplateColumns: '10rem 10rem 15rem 13rem 10rem 10rem 10rem 10rem',
        background: '#f9f9fa',
        fontFamily: 'gothamBold,Arial, Helvetica, sans-serif',
        width: '89rem',
        position: 'relative',
    },
    headingItem: {
        fontSize: '.8em',
        paddingTop: '.5rem',
        paddingBottom: '.5rem',
        paddingLeft: '.75rem',
        borderBottom: '1px solid #CCCCCC'
    },
    headingLabel: {
        borderBottom: '1px dashed',
        cursor: 'pointer'
    },
    first: {
        paddingLeft: '.5rem',
        position: 'sticky',
        left: 0,
        background: '#f9f9fa'
    },
    last: {
        paddingRight: '.5rem'
    },
    center: {
        display: 'flex',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    paginator: {
        background: '#f9f9fa',
        borderBottom: '1px solid #CCCCCC',
        borderRight: '1px solid #CCCCCC',
        borderLeft: '1px solid #CCCCCC',
        borderTop: 'none',
        borderRadius: '0 0 3px 3px',
    }

});

interface Props {
    onPageChange: Function;
    onSortClick: Function;
    searchResults: Variant[];
    variantListSize: number;
    loadingVariantListSize: boolean;
    loadingResults: boolean;
    searchTerm: string;
    currentPage: number;
}

interface State {
    loading: boolean;
    searchResults: Variant[];
    sortMetadata: any;
}

export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: props.loadingResults,
            searchResults: props.searchResults,
            sortMetadata: {'variant_id': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 1},
            'gene': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 2},
            'allele_count': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 6},
            'allele_number': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 7},
            'allele_frequency': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 8}}
        };
    }

    columnNames = [
        'Variant ID',
        'Gene',
        'Consequence',
        'Protein Change',
        'Clinical Significance',
        'Allele Count',
        'Allele Number',
        'Allele Frequency'];

    componentDidUpdate(prevProps: Readonly<Props>) {
        const { searchResults, loadingResults } = this.props;
        if (prevProps.searchResults !== searchResults) {
            this.setState({ searchResults: searchResults, loading: loadingResults });
        }
    }

    handlePageClick = (data) => {
        const { searchTerm } = this.props;
        this.setState({ loading: true });
        this.props.onPageChange({ selectedPage: data.selected, searchTerm: searchTerm });
    }

    sortClick(key: string) {
        const {sortMetadata} = this.state;
        sortMetadata[key]['sortActive'] = true;
        const direction = sortMetadata[key]['sortDirection'];
        direction === 'asc' ? sortMetadata[key]['sortDirection'] = 'desc' : sortMetadata[key]['sortDirection'] = 'asc';
        for (const sKey in sortMetadata) {
            if (sKey !== key) {
                sortMetadata[sKey]['sortActive'] = false;
                sortMetadata[sKey]['sortDirection'] = 'asc';
            }
        }
        this.setState({sortMetadata: sortMetadata}, () => {
            this.props.onSortClick(this.state.sortMetadata);
        });
    }

    render() {
        const { loadingVariantListSize, variantListSize, currentPage } = this.props;
        const { loading, searchResults, sortMetadata } = this.state;
        return <React.Fragment> {(!loading && !loadingVariantListSize && searchResults && searchResults.length) ?
            <div style={styles.tableContainer}>
                <div style={styles.headerLayout}>
                    <div style={{ ...styles.headingItem, ...styles.first }}><span style={styles.headingLabel}>Variant ID</span>
                    {sortMetadata['variant_id']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.sortClick('variant_id'); }}></i> :
                    <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                        onClick={() => {this.sortClick('variant_id'); }}></i> }
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Gene</span>
                    {sortMetadata['gene']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.setState({loading: true}); this.sortClick('gene'); }}></i> :
                    <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.sortClick('gene'); }}></i> }
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Consequence</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Protein Change</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Clinical Significance</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Allele Count</span>
                    {sortMetadata['allele_count']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.setState({loading: true}); this.sortClick('allele_count'); }}></i> :
                    <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.sortClick('allele_count'); }}></i> }</div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Allele Number</span>
                    {sortMetadata['allele_number']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.setState({loading: true}); this.sortClick('allele_number'); }}></i> :
                    <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.sortClick('allele_number'); }}></i> }
                    </div>
                    <div style={{ ...styles.headingItem, ...styles.last }}><span style={styles.headingLabel}>Allele Frequency</span>
                    {sortMetadata['allele_frequency']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.setState({loading: true}); this.sortClick('allele_frequency'); }}></i> :
                    <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.sortClick('allele_frequency'); }}></i> }
                    </div>
                </div>
                {searchResults && searchResults.map((variant, index) => {
                    return <VariantRowComponent key={variant.variantId} variant={variant} />;
                })}
            </div> : <div style={styles.tableFrame}>{(loading || loadingVariantListSize) &&
                        <div style={styles.center}><Spinner /> </div>}</div>
        }
            <div style={styles.paginator}>
                <ReactPaginate
                    previousLabel={'Previous'}
                    nextLabel={'Next'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    activeClassName={'active'}
                    pageCount={Math.ceil(variantListSize / 50)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={this.handlePageClick}
                    containerClassName={'pagination'}
                    forcePage={currentPage}
                />
            </div>
        </React.Fragment>;
    }
}
