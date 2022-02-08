import { reactStyles } from 'app/utils';
import { Spinner } from 'app/utils/spinner';
import { Variant } from 'publicGenerated';
import * as React from 'react';
import { TablePaginatorComponent } from './table-paginator.component';
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
        gridTemplateColumns: '13rem 10rem 13rem 10rem 12rem 10rem 10rem 10rem',
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
        display: 'flex',
        flexDirection: 'row',
        gap: '2em',
        justifyContent: 'flex-end'
    }

});

const css = `
`;

interface Props {
    onPageChange: Function;
    onSortClick: Function;
    onRowCountChange: Function;
    searchResults: Variant[];
    variantListSize: number;
    loadingVariantListSize: boolean;
    loadingResults: boolean;
    searchTerm: string;
    currentPage: number;
    rowCount: number;
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
            sortMetadata: {'variant_id': {'sortActive': true, 'sortDirection': 'asc', 'sortOrder': 1},
                'gene': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 2},
                'consequence': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 3},
                'protein_change': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 4},
                'clinical_significance': {'sortActive': false, 'sortDirection': 'asc', 'sortOrder': 5},
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
        this.props.onPageChange({ selectedPage: data, searchTerm: searchTerm });
    }

    handleRowCountChange = (data) => {
        this.props.onRowCountChange({rowCount: data});
    }

    sortClick(key: string) {
        const {sortMetadata} = this.state;
        if (sortMetadata[key]['sortActive']) {
            const direction = sortMetadata[key]['sortDirection'];
            direction === 'asc' ? sortMetadata[key]['sortDirection'] = 'desc' : sortMetadata[key]['sortDirection'] = 'asc';
        } else {
            sortMetadata[key]['sortActive'] = true;
        }

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
        const { loadingVariantListSize, variantListSize, currentPage, rowCount } = this.props;
        const { loading, searchResults, sortMetadata } = this.state;
        return <React.Fragment>
                <style>{css}</style>
        {(!loading && !loadingVariantListSize && searchResults && searchResults.length) ?
            <div style={styles.tableContainer}>
                <div style={styles.headerLayout}>
                    <div style={{ ...styles.headingItem, ...styles.first }}><span style={styles.headingLabel}
                    onClick={() => {this.sortClick('variant_id'); }} title='Click to sort'>Variant ID</span>
                    {sortMetadata['variant_id']['sortActive'] &&
                    <React.Fragment>{sortMetadata['variant_id']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('variant_id'); }}></i>
                    : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('variant_id'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel} onClick={() => {this.sortClick('gene'); }}
                    title='Click to sort'>Gene</span>
                    {sortMetadata['gene']['sortActive'] &&
                    <React.Fragment>{sortMetadata['gene']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('gene'); }}></i>
                    : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('gene'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel} onClick={() => {this.sortClick('consequence'); }}
                    title='Click to sort'>Consequence</span>
                     {sortMetadata['consequence']['sortActive'] &&
                     <React.Fragment>{sortMetadata['consequence']['sortDirection'] === 'asc' ?
                     <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                 onClick={() => {this.sortClick('consequence'); }}></i>
                     : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                 onClick={() => {this.sortClick('consequence'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel} onClick={() => {this.sortClick('protein_change'); }}
                    title='Click to sort'>Protein Change</span>
                     {sortMetadata['protein_change']['sortActive'] &&
                     <React.Fragment>{sortMetadata['protein_change']['sortDirection'] === 'asc' ?
                     <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                 onClick={() => {this.sortClick('protein_change'); }}></i>
                     : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                 onClick={() => {this.sortClick('protein_change'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel}
                    onClick={() => {this.sortClick('clinical_significance'); }} title='Click to sort'>Clinical Significance</span>
                     {sortMetadata['clinical_significance']['sortActive'] &&
                     <React.Fragment>{sortMetadata['clinical_significance']['sortDirection'] === 'asc' ?
                     <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                 onClick={() => {this.sortClick('clinical_significance'); }}></i>
                     : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                 onClick={() => {this.sortClick('clinical_significance'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel} onClick={() => {this.sortClick('allele_count'); }}
                    title='Click to sort'>Allele Count</span>
                    {sortMetadata['allele_count']['sortActive'] &&
                    <React.Fragment>{sortMetadata['allele_count']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('allele_count'); }}></i>
                    : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('allele_count'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={styles.headingItem}><span style={styles.headingLabel} onClick={() => {this.sortClick('allele_number'); }}
                    title='Click to sort'>Allele Number</span>
                    {sortMetadata['allele_number']['sortActive'] &&
                    <React.Fragment>{sortMetadata['allele_number']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('allele_number'); }}></i>
                    : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('allele_number'); }}></i>}</React.Fragment>}
                    </div>
                    <div style={{ ...styles.headingItem, ...styles.last }}><span style={styles.headingLabel}
                    onClick={() => {this.sortClick('allele_frequency'); }} title='Click to sort'>Allele Frequency</span>
                    {sortMetadata['allele_frequency']['sortActive'] &&
                    <React.Fragment>{sortMetadata['allele_frequency']['sortDirection'] === 'asc' ?
                    <i className='fas fa-arrow-down' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('allele_frequency'); }}></i>
                    : <i className='fas fa-arrow-up' style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}
                                                onClick={() => {this.sortClick('allele_frequency'); }}></i>}</React.Fragment>}
                    </div>
                </div>
                {searchResults && searchResults.map((variant, index) => {
                    return <VariantRowComponent key={variant.variantId} variant={variant} />;
                })}
            </div> : <div style={styles.tableFrame}>{(loading || loadingVariantListSize) &&
                        <div style={styles.center}><Spinner /> </div>}</div>
        }
            {(!loading && !loadingVariantListSize && searchResults && variantListSize > 50) && <div style={styles.paginator}>
                <TablePaginatorComponent pageCount={Math.ceil(variantListSize / 50)} variantListSize={variantListSize}
                currentPage={currentPage} resultsSize={searchResults.length}
                rowCount={rowCount}
                onPageChange={(info) => { this.handlePageClick(info); }}
                onRowCountChange={(info) => { this.handleRowCountChange(info); }}/>
            </div>}
        </React.Fragment>;
    }
}
