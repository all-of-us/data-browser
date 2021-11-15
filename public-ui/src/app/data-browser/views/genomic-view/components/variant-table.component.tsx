import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import { Variant } from 'publicGenerated';
import * as React from 'react';
import ReactPaginate from 'react-paginate';
import { VariantRowComponent } from './variant-row.component';

const styles = reactStyles({
    tableContainer: {
        border: '1px solid #CCCCCC',
        borderRadius: '3px',
        background: '#FAFAFA',
        marginTop: '0.5rem',
        overflow: 'scroll'
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
}

export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            numPages: Math.ceil(props.variantListSize / 50),
            page: 1,
            loading: props.loading ? props.loading : true,
            searchResults: props.searchResults,
            currentPage: 1
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
        const {searchTerm} = this.props;
        this.setState({loading: true, page: data.selected + 1, currentPage: data.selected + 1});
        this.props.onPageChange();
        genomicsApi().searchVariants(searchTerm, data.selected + 1).then(
                results => {
                    this.setState({
                        searchResults: results.items,
                        loading: false
                    }, () => { });
                }
        );
    }

    render() {
        const { numPages, loading, searchResults } = this.state;
        return <React.Fragment>
            {searchResults ?
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
                    return <VariantRowComponent key={index} variant={variant} />;
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
