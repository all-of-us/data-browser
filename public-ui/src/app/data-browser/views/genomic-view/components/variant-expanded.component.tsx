import { PopulationChartReactComponent } from 'app/data-browser/views/genomic-view/components/population-chart.component';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { prepVariantPopulationDetails } from 'app/utils/constants';
import { Spinner } from 'app/utils/spinner';
import { Variant, VariantInfo } from 'publicGenerated';
import * as React from 'react';

const css = `
.exit{
    width:2rem;
    height:2rem;
    color:#216FB4;
}
.popTable:first-of-type {
    padding-top: 1rem;
}
.popTable:last-of-type {
    padding-bottom: 1rem;
}
`;

const styles = reactStyles({
    variantExpanded: {
        position: 'sticky',
        width: '100%',
        background: '#ECF1F4',
        top: '0px',
        left: '0px',
        padding: '.5em',
        paddingLeft: '1em',
        borderTop: '1px solid rgb(204, 204, 204)'
    },
    top: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #979797',
        width: '100%',
        margin: '0',
        paddingBottom: '.5rem',
    },
    variantId: {
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center'
    },
    body: {
        display: 'grid',
        gridTemplateColumns: '31% 23% 23% 23%',
        columnGap: '1rem',
        rowGap: '1rem',
        paddingTop: '1rem',
        fontSize: '14px',
        width: '75%'
    },
    catHeading: {
        fontFamily: 'gothamBold,Arial, Helvetica, sans-serif'
    },
    catInfo: {
        overflowWrap: 'anywhere'
    },
    loading: {
        transform: 'scale(.5)'
    },
    popTableContainer: {
        display: 'grid',
        gridTemplateColumns: '60% 40%',
        textAlign: 'left',
        alignItems: 'center'
    },
    popTable: {
        display: 'grid',
        gridTemplateColumns: '31% 23% 23% 23%',
        fontSize: '14px'
    },
    popTitle: {
        fontWeight: 'bold',
        fontFamily: 'gothamBold,Arial, Helvetica, sans-serif',
        fontSize: '18px',
        marginTop: '2rem'
    },
    popTableHeading: {
        padding: '.5rem',
        paddingBottom: '0',
        paddingTop: '0'
    },
    popTableBody: {
        borderBottom: '1px solid #DDE0E4',
        marginBottom: '2rem'
    },
    popTableData: {
        border: '1px solid #DDE0E4',
        borderBottom: 'none',
        borderLeft: 'none',
        padding: '.5rem'
    }

});

interface Props {
    closed: Function;
    variant: Variant;
    variantDetails: VariantInfo;
    loading: boolean;
}
// tslint:disable-next-line:no-empty-interface
interface State {

}

export class VariantExpandedComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { variantDetails, variant, loading } = this.props;
        let variantPopulationDetails: any[] = [];
        if (!loading) {
            variantPopulationDetails = prepVariantPopulationDetails(variantDetails);
        }
        return <React.Fragment>
            <style>{css}</style>
            <div style={styles.variantExpanded}>
                <div style={styles.top}>
                    <span style={styles.variantId}><strong>Variant ID: </strong> {!loading ?
                    <span style={{ paddingLeft: '1em', overflowWrap: 'anywhere' }}>
                        {variant.variantId}</span> : <div style={styles.loading}><Spinner /></div>} </span>
                    <div ><ClrIcon onClick={(e) => this.props.closed()} className='exit' shape='window-close' /></div>
                </div>
                {!loading && <React.Fragment><div style={styles.body}>
                    <div>
                        <span style={styles.catHeading}>Consequence:</span><br />
                        <span style={styles.catInfo}>{variant.consequence}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Protein Change:</span><br />
                        <span style={styles.catInfo}>{variant.proteinChange}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>DNA Change:</span><br />
                        <span style={styles.catInfo}>{variantDetails.dnaChange}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Transcript:</span><br />
                        <span style={styles.catInfo}>{variantDetails.transcript}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>RS Number:</span><br />
                        <span style={styles.catInfo}>{variantDetails.rsNumber}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Gene:</span><br />
                        <span style={styles.catInfo}>{variant.genes}</span>
                    </div>
                    <div>
                        <span style={styles.catHeading}>Clinical Significance:</span><br />
                        <span style={styles.catInfo}>{variant.clinicalSignificance}</span>
                    </div>
                </div>
                    <div style={styles.popTableContainer}>
                        <div>
                            <h4 style={styles.popTitle}>Genetic Ancestry Populations</h4>
                            <div style={styles.popTable} className='popTable'>
                                <div style={styles.popTableHeading}></div>
                                <div style={styles.popTableHeading}><strong>Allele Count</strong></div>
                                <div style={styles.popTableHeading}><strong>Allele Number</strong></div>
                                <div style={styles.popTableHeading}><strong>Allele Frequency</strong></div>
                            </div>
                            <div style={styles.popTableBody}>
                                {variantPopulationDetails.map((item, index) => {
                                    const colorStyle = { color: item.color };
                                    return <div key={index} style={styles.popTable}>
                                        <div style={styles.popTableData}>{(item.Ancestry !== 'Total') ?
                                            <span><i className='fas fa-circle' style={{ ...colorStyle, marginRight: '.5rem', transform: 'scale(1.3)' }} />
                                                {item.Ancestry} </span> : <strong>{item.Ancestry}</strong>} </div>
                                        <div style={styles.popTableData}>{item.Ancestry !== 'Total' ?
                                            <React.Fragment>{item.AlleleCount}</React.Fragment> :
                                            <strong>{item.AlleleCount}</strong>}</div>
                                        <div style={styles.popTableData}>{item.Ancestry !== 'Total' ?
                                            <React.Fragment>{item.AlleleNumber}</React.Fragment> :
                                            <strong>{item.AlleleNumber}</strong>}</div>
                                        <div style={styles.popTableData}>{item.Ancestry !== 'Total' ?
                                            <React.Fragment>{item.AlleleFrequency.toFixed(2)}</React.Fragment>
                                            : <strong>{item.AlleleFrequency.toFixed(2)}</strong>}</div>
                                    </div>;
                                })}
                            </div>
                        </div>
                        <PopulationChartReactComponent variantPopulationDetails={variantPopulationDetails} />
                    </div>
                </React.Fragment>}
            </div>
        </React.Fragment>;
    }
}
