import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import { Variant, VariantListResponse } from 'publicGenerated';
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
        borderBottom: '1px dashed'
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
    searchResults: Variant[];
    variantListSize: number;
    loadingVariantListSize: boolean;
    loadingResults: boolean;
    searchTerm: string;
    currentPage: number;
}

interface State {
    numPages: number;
    loading: boolean;
    searchResults: Variant[];
}

export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            numPages: Math.ceil(props.variantListSize / 50),
            loading: props.searchResults ? props.loadingResults : true,
            searchResults: props.searchResults
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
        const { variantListSize, searchResults, loadingResults } = this.props;
        if (prevProps.searchResults !== searchResults) {
            this.setState({ numPages: Math.ceil(variantListSize / 50), searchResults: searchResults, loading: loadingResults });
        }
    }

    handlePageClick = (data) => {
        const { searchTerm } = this.props;
        this.setState({ loading: true });
        this.props.onPageChange({ selectedPage: data.selected, searchTerm: searchTerm });
    }

    render() {
        const { loadingVariantListSize, variantListSize, currentPage } = this.props;
        const { numPages, loading, searchResults } = this.state;
        return <React.Fragment> {(!loading && !loadingVariantListSize && searchResults && searchResults.length) ?
            <div style={styles.tableContainer}>
                <div style={styles.headerLayout}>
                    <div style={{ ...styles.headingItem, ...styles.first }}><span style={styles.headingLabel}>Variant ID</span></div>
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
            </div> : <div style={styles.tableFrame}>{(loading || loadingVariantListSize) && <div style={styles.center}><Spinner /> </div>}</div>
        }

            <div style={styles.paginator}>
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
                    forcePage={currentPage}
                />
            </div>
        </React.Fragment>;
    }
}
