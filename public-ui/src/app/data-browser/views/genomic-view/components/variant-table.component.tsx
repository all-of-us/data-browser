import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import { Variant } from 'publicGenerated';
import { SortColumnDetails, SortMetadata } from 'publicGenerated/fetch';
import * as React from 'react';
import ReactPaginate from 'react-paginate';
import { VariantRowComponent } from './variant-row.component';

const styles = reactStyles({
    tableContainer: {
        border: '1px solid #CCCCCC',
        borderRadius: '3px',
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
    }

});

interface Props {
    searchResults: Variant[];
    variantListSize: number;
    loading: boolean;
    searchTerm: string;
    onPageChange: Function;
}

interface State {
    numPages: number;
    page: number;
    loading: boolean;
    searchResults: Variant[];
    currentPage: number;
    sortMetadata: any;
}

class SortMetadataClass implements SortMetadata {
    variantId: any;
    constructor(variantId: any) {
        this.variantId = variantId;
    }
}

class SortColumnDetailsClass implements SortColumnDetails {
    sortActive: boolean;
    sortDirection: string;
    sortOrder: number;
    constructor(sortActive: boolean, sortDirection: string, sortOrder: number) {
        this.sortActive = sortActive;
        this.sortDirection = sortDirection;
        this.sortOrder = sortOrder;
    }
}

export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            numPages: Math.ceil(props.variantListSize / 50),
            page: 1,
            loading: props.loading == null ? true : props.loading,
            searchResults: props.searchResults,
            currentPage: 1,
            sortMetadata: {'variant_id': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 1}}
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
        const {variantListSize, searchResults, loading} = this.props;
        if (prevProps.searchResults !== searchResults) {
            this.setState({numPages: Math.ceil(variantListSize / 50), searchResults: searchResults, loading: loading});
        }
   }

    handlePageClick = (data) => {
        this.setState({loading: true, page: data.selected + 1, currentPage: data.selected + 1},
            () => { this.fetchVariantData(); });
        this.props.onPageChange();
    }

    fetchVariantData() {
        const {searchTerm} = this.props;
        const {page, sortMetadata} = this.state;
        const sortColumnDetailsObj = new SortColumnDetailsClass(sortMetadata['variant_id']['sortActive'], sortMetadata['variant_id']['sortDirection'],
        sortMetadata['variant_id']['sortOrder']);
        const sortMetadataObj = new SortMetadataClass(sortColumnDetailsObj);
        const searchRequest = {
                query: searchTerm,
                pageNumber: page,
                sortMetadata: sortMetadataObj
        };
        genomicsApi().searchVariants(searchRequest).then(
                results => {
                    this.setState({
                        searchResults: results.items,
                        loading: false
                    });
                }
        );
    }

    sortClick(key: string) {
        const {sortMetadata} = this.state;
        sortMetadata[key]['sortActive'] = true;
        const direction = sortMetadata[key]['sortDirection'];
        direction === 'asc' ? sortMetadata[key]['sortDirection'] = 'desc' : sortMetadata[key]['sortDirection'] = 'asc';
        this.setState({sortMetadata: sortMetadata}, () => {
            this.fetchVariantData();
        });
    }

    render() {
       const { numPages, loading, searchResults, sortMetadata } = this.state;
       return <React.Fragment> {(searchResults) ?
            <div style={styles.tableContainer}>
                <div style={styles.headerLayout}>
                    <div style={{ ...styles.headingItem, ...styles.first }}><span style={styles.headingLabel}>Variant ID</span>
                    {sortMetadata['variant_id']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                    onClick={() => {this.setState({loading: true}); this.sortClick('variant_id'); }}></i> :
                    <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                        onClick={() => {this.sortClick('variant_id'); }}></i> }
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Gene</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Consequence</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Protein Change</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Clinical Significance</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Allele Count</span></div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}>Allele Number</span></div>
                    <div style={{ ...styles.headingItem, ...styles.last }}><span style={styles.headingLabel}>Allele Frequency</span></div>
                </div>
                {searchResults && searchResults.map((variant, index) => {
                    return <VariantRowComponent key={variant.variantId} variant={variant} />;
                })}

                {(numPages && numPages > 1) &&
                    <ReactPaginate
                        previousLabel={'Previous'}
                        nextLabel={'Next'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        activeClassName={'active'}
                        pageCount={numPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={this.handlePageClick}
                        containerClassName={'pagination'}
                    />}

            </div> : <div style={styles.tableFrame}>{loading && <div style={styles.center}><Spinner /> </div>}</div>
        }

        </React.Fragment>;
    }
}
