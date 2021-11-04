import { reactStyles } from 'app/utils';
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
    }

});

interface Props {
    searchResults: Variant[];
    variantListSize: number;
}

interface State {
    numPages: number;
}

export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            numPages: 0
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

    handlePageClick() {
        console.log('Clicked on paginator');
    }

    render() {
        const { numPages } = this.state;
        const { searchResults, variantListSize } = this.props;
        return <React.Fragment> {searchResults &&
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
                {searchResults && searchResults.map((varData, index) => {
                    return <VariantRowComponent key={index} varData={varData} />;
                })}

                {variantListSize &&
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

            </div>
        }
            {!searchResults && <div style={styles.tableFrame}></div>
            }
        </React.Fragment>;
    }
}
