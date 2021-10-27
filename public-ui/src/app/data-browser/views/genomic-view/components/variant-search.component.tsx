import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import _ from 'lodash';
import * as React from 'react';

const styles = reactStyles({
    searchContainer: {
        paddingTop: '1em',
        paddingBottom: '1em',
        display: 'flex',
        flexDirection: 'row'
    },
    searchHelpText: {
        paddingLeft: '1em',
        paddingTop: '3.6em',
        fontSize: '0.75em'
    }
});

// tslint:disable-next-line:no-empty-interface
interface Props {

}
// tslint:disable-next-line:no-empty-interface
interface State {
    searchWord: string;
    searchResultSize: number;
    loading: boolean;
    searchSizeLoading: boolean;
}



export class VariantSearchComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            searchWord: localStorage.getItem('genomicSearchText') ? localStorage.getItem('genomicSearchText') : '',
            searchResultSize: 0,
            loading: true,
            searchSizeLoading: true
        };
    }

    search = _.debounce((val) => this.getSearchSize(), 1000);

    // life cycle hook
    componentDidMount() {
        this.getSearchSize();
    }

    handleChange(val) {
        this.setState({ searchWord: val});
        this.search(val);
    }

    getSearchSize() {
        return genomicsApi().getVariantSearchResultSize(this.state.searchWord).then(
            result => {
                this.setState({searchResultSize: result, searchSizeLoading: false});
            }
        ).catch(e => {
            console.log(e, 'error');
            this.setState({ searchSizeLoading: false });
        });
    }

    render() {
        const {searchWord, searchResultSize, searchSizeLoading} = this.state;
        return <React.Fragment>
            <div style={styles.searchContainer}>
            <div>
            <SearchComponent value={searchWord} searchTitle='Search' domain='genomics'
                                        onChange={(val) => this.handleChange(val)}
                                        onClear={() => this.handleChange('')} />
            </div>
            <div style={styles.searchHelpText}>
            Examples: <br></br>
            Gene: TP53, Variant: 17-7577097-C-T, <br></br>
            Genomic Region: chr17:7572855-7579987
            </div>
            </div>
            {!searchSizeLoading && searchResultSize && <div>{searchResultSize.toLocaleString()} variants found</div>}
        </React.Fragment>;
    }
}
