import { genomicsApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { Variant, VariantInfo } from 'publicGenerated';
import * as React from 'react';
import { VariantExpandedComponent } from './variant-expanded.component';

const styles = reactStyles({
    rowLayout: {
        display: 'grid',
        gridTemplateColumns: '10rem 10rem 15rem 13rem 10rem 10rem 10rem 10rem',
        alignItems: 'center',
        width: '89rem',
        background: 'white',
        fontSize: '.8em',
        borderBottom: '1px solid #CCCCCC',
    },
    variant: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        borderRight: '1px solid #CCCCCC',
        boxShadow: 'rgb(204 204 204) 0.2rem 0px 8px -2px',
        paddingRight: '0.25rem',
        color: '#216FB4'
    },
    caretIcon: {
        fontFamily: 'gothamBold,Arial, Helvetica, sans-serif',
        fontWeight: 'bold',
    },
    rowItem: {
        width: '100%',
        paddingTop: '.5rem',
        paddingBottom: '.5rem',
        paddingLeft: '.75rem'
    },
    first: {
        paddingLeft: '.5rem'
    },
    last: {
        paddingRight: '.5rem'
    }
});


interface Props {
    varData: Variant;
}

interface State {
    variantCliked: boolean;
    variantDetails: VariantInfo;
}

export class VariantRowComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            variantCliked: false,
            variantDetails: null
        };
    }

    getVariantDetails(variantId: string) {
        genomicsApi().getVariantDetails(variantId).then((results: VariantInfo) => {
            this.setState({
                variantDetails: results
            });
        });
    }

    handleClick(variantId?: string) {
        if (variantId) {
            this.getVariantDetails(variantId);
        }
        this.setState({
            variantCliked: !this.state.variantCliked
        });
    }

    render() {
        const { varData } = this.props;
        const { variantCliked, variantDetails } = this.state;
        return <React.Fragment>
            {variantCliked ? <VariantExpandedComponent
                variant={varData}
                variantDetails={variantDetails}
                closed={() => this.handleClick()} /> :
                <div style={styles.rowLayout}>
                    <div onClick={() => this.handleClick(varData.variantId)} style={styles.variant}>
                        <div style={{ ...styles.first, ...styles.rowItem, overflowWrap: 'anywhere' }}>{varData.variantId}&#x20;
                        </div>
                        <ClrIcon style={styles.caretIcon} onClick={(e) => { }}
                            size='lg' shape='caret' dir='down' />
                    </div>
                    <div style={styles.rowItem}>{varData.genes}</div>
                    <div style={styles.rowItem}>
                        {varData.consequence.length ? varData.consequence.map((item, index) => {
                            return <div key={index}>{item}<br /></div>;
                        }) : <div>–</div>}
                    </div>
                    {varData.proteinChange ? <div style={{ overflowWrap: 'anywhere', ...styles.rowItem }}>
                        {varData.proteinChange}</div> : <div>–</div>}
                    <div style={styles.rowItem}>
                        {varData.clinicalSignificance.length ? varData.clinicalSignificance.map((item, index) => {
                            return <div key={index}>{item}<br /></div>;
                        }) : <div>–</div>}
                    </div>
                    <div style={styles.rowItem}>{varData.alleleCount}</div>
                    <div style={styles.rowItem}>{varData.alleleNumber}</div>
                    <div style={styles.rowItem}>{varData.alleleFrequency}</div>
                </div>
            }

        </React.Fragment>;
    }
}









