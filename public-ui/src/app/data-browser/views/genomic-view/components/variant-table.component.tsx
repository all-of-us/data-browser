import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import ReactPaginate from 'react-paginate';
import { VariantRowComponent } from './variant-row.component';

const styles = reactStyles({
    border: {
        border: '1px solid',
        margin: '1rem'
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

    handlePageClick() {
        console.log('Clicked on paginator');
    }

    componentDidMount() {
        genomicsApi().getVariantSearchResultSize('').then(result => {
            console.log(result);
            this.setState({loading: false, variantListSize: result, numPages: Math.ceil(result / 50)});
        }).catch(e => {
            console.log(e, 'error');
        });
    }

    render() {
        const {loading, numPages} = this.state;
        const {searchResults} = this.props;
        return <React.Fragment>
            <div style={styles.border}>
                <p>I am Variant Table</p>
                <VariantRowComponent />
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
        </React.Fragment>;
    }
}
