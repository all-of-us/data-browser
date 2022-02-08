import { reactStyles } from 'app/utils';
import * as React from 'react';

const styles = reactStyles({
    pageNum: {
        alignSelf: 'flex-end',
        paddingRight: '1em',
        fontSize: '12px',
        marginTop: '1em',
        marginBottom: '1em'
    },
    pageDropDownLabel: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1em'
    },
    pageButton: {
        textDecoration: 'none',
        display: 'inline-block',
        marginRight: '2em',
        color: 'black',
        border: 'none',
        background: 'none',
        cursor: 'pointer'
    },
    disabledPageButton: {
        textDecoration: 'none',
        display: 'inline-block',
        marginRight: '2em',
        color: 'grey',
        border: 'none',
        background: 'none',
        cursor: 'none',
        pointerEvents: 'none'
    },
    enabledIcon: {
        color: 'black'
    },
    disabledIcon: {
        color: '#ddd'
    }
});

const css = `
`;

interface Props {
    pageCount: number;
    variantListSize: number;
    currentPage: number;
    resultsSize: number;
    onPageChange: Function;
    rowCount: number;
    onRowCountChange: Function;
}

interface State {
    currentPage: number;
    rowCount: number;
}

export class TablePaginatorComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentPage: props.currentPage ? props.currentPage : 1,
            rowCount: props.rowCount ? props.rowCount : 50
        };
    }

    handleChange(event) {
        this.setState({currentPage: +event.target.value}, () => {this.props.onPageChange(this.state.currentPage); });
    }

    rowCountChange(event) {
        this.setState({rowCount: +event.target.value}, () => {
            this.props.onRowCountChange(this.state.rowCount); } );
    }

    render() {
        const {currentPage, rowCount} = this.state;
        const {pageCount, variantListSize, resultsSize} = this.props;
        const options = [];
        for (let i = 0; i < pageCount; i++) {
              const obj = {};
              obj['value'] = i + 1;
              obj['label'] = i + 1;
              options.push(obj);
        }
        return <React.Fragment>
                        <style>{css}</style>
                        <div style={styles.pageNum}>
                            <label style={styles.pageDropDownLabel}>Page:
                                <select value={currentPage} onChange={this.handleChange.bind(this)}>
                                    {options.map(({ value, label }, index) => <option value={value} key={value}>{label}</option>)}
                                </select>
                            </label></div>
                        <div style={styles.pageNum}>
                            <label style={styles.pageDropDownLabel}>Rows per page:
                                <select value={rowCount} onChange={this.rowCountChange.bind(this)}>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </label>
                        </div>
                        <div style={styles.pageNum}>{resultsSize} of {variantListSize} entries</div>
                        <div style={styles.pageNum}>
                            <button style={currentPage !== 1 ? styles.pageButton : styles.disabledPageButton} disabled={currentPage === 1}
                                onClick={(e) => {this.setState({currentPage: this.state.currentPage - 1}, () => {
                                    this.props.onPageChange(this.state.currentPage); })};}>
                                <i className='fas fa-angle-left' style={currentPage !== 1 ?
                                    styles.enabledIcon : styles.disabledIcon}/></button>
                            <button style={currentPage !== pageCount ? styles.pageButton : styles.disabledPageButton}
                                disabled={currentPage === pageCount}
                            onClick={(e) => {this.setState({currentPage: this.state.currentPage + 1}, () => {
                                this.props.onPageChange(this.state.currentPage);})}}>
                                <i className='fas fa-angle-right' style={currentPage !== pageCount ?
                                    styles.enabledIcon : styles.disabledIcon}/></button>
                        </div>
               </React.Fragment>;
    }
}
