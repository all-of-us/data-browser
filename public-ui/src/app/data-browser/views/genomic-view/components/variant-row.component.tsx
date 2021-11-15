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
    },
    variantId: {
        wordBreak: 'break-all'
    }
});

interface Props {
    variant: Variant;
}

interface State {
    variantClicked: boolean;
    variantDetails: VariantInfo;
    loadingVarDetails: boolean;
}

export class VariantRowComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            variantClicked: false,
            variantDetails: null,
            loadingVarDetails: true
        };
    }

    getVariantDetails(variantId: string) {
        genomicsApi().getVariantDetails(variantId).then((results: VariantInfo) => {

            this.setState({
                variantDetails: results,
                loadingVarDetails: false
            });
        });
    }

    handleClick(variantId?: string) {
        if (variantId) {
            this.getVariantDetails(variantId);
        }
        this.setState({
            variantClicked: !this.state.variantClicked
        });
    }

    render() {
        const { variant } = this.props;
        const { variantClicked, variantDetails, loadingVarDetails } = this.state;
        return <React.Fragment>
            {variantClicked ? <VariantExpandedComponent
                loading={loadingVarDetails}
                variant={variant}
                variantDetails={variantDetails}
                closed={() => this.handleClick()} /> :
                <div style={styles.rowLayout}>
                    <div onClick={() => this.handleClick(variant.variantId)} style={styles.variant}>
                        <div style={{ ...styles.first, ...styles.rowItem, ...styles.variantId }}>{(variant.variantId.length > 40) ?
                        <React.Fragment>{variant.variantId.substr(0, 40)} &#8230;</React.Fragment> : variant.variantId} &#x20;
                                                <ClrIcon style={styles.caretIcon} onClick={(e) => { }}
                                                    size='lg' shape='caret' dir='down' />
                        </div>
                    </div>
                    <div style={styles.rowItem}>{variant.genes}</div>
                    <div style={styles.rowItem}>
                        {variant.consequence.length ? variant.consequence.map((item, index) => {
                            return <div key={index}>{item}<br /></div>;
                        }) : <div>–</div>}
                    </div>
                    {variant.proteinChange ? <div style={{ overflowWrap: 'anywhere', ...styles.rowItem }}>
                        {variant.proteinChange}</div> : <div>–</div>}
                    <div style={styles.rowItem}>
                        {variant.clinicalSignificance.length ? variant.clinicalSignificance.map((item, index) => {
                            return <div key={index}>{item}<br /></div>;
                        }) : <div>–</div>}
                    </div>
                    <div style={styles.rowItem}>{variant.alleleCount}</div>
                    <div style={styles.rowItem}>{variant.alleleNumber}</div>
                    <div style={styles.rowItem}>{variant.alleleFrequency}</div>
                </div>
            }

        </React.Fragment>;
    }
}
