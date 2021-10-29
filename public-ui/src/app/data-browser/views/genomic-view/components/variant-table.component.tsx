import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import ReactPaginate from 'react-paginate';
import { VariantRowComponent } from './variant-row.component';

const styles = reactStyles({
    tableContainer: {
        border: '1px solid #CCCCCC',
        borderRadius: '3px',
        background: '#FAFAFA',
        marginTop: '0.5rem'
        // margin: '1rem'
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
        gridTemplateColumns: '10rem 10rem 10rem 10rem 10rem 10rem 10rem 10rem',
        padding: '0.5rem',
        background: '#f9f9fa',
        overflow: 'hidden'
    },
    headingLabel: {
        fontSize: '.8em'
    }
});


// tslint:disable-next-line:no-empty-interface
interface Props {
    searchResults: any[];
}
// tslint:disable-next-line:no-empty-interface
interface State {
    variantListSize: number;
    numPages: number;
    loading: boolean;
}



export class VariantTableComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            variantListSize: 0,
            loading: true,
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
        'Allele Frequency']

    handlePageClick() {
        console.log('Clicked on paginator');
    }

    componentDidMount() {

        // genomicsApi().getVariantSearchResultSize('').then(result => {
        //     this.setState({ loading: false, variantListSize: result, numPages: Math.ceil(result / 50) });
        // }).catch(e => {
        //     console.log(e, 'error');
        // });

    }

    render() {
        const { loading, numPages, variantListSize } = this.state;
        const { searchResults } = this.props;
        return <React.Fragment> {searchResults &&
            <div style={styles.tableContainer}>
                <div style={styles.headerLayout}>
                    {
                        this.columnNames.map((heading, index) => {
                            return <div style={styles.headingLabel} key={index}>{heading}</div>
                        })
                    }
                </div>

                {!loading &&
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
