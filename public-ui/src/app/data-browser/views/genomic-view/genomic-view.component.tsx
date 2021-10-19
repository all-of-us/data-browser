import {withRouteData} from 'app/components/app-router';
import { reactStyles } from 'app/utils';
import * as React from 'react';

const styles = reactStyles({
    genoLayout: {
        display: 'grid',
        gridTemplateColumns: '20% 80%',
        columnGap: '0.5rem'
    },
    genoMenuItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        fontSize: '0.8em',
        /* border-bottom: 1px solid #262262 ; */
        cursor: 'pointer'
    },
    genoMenuItemContainer: {
        padding: '0.25rem 0rem',
        borderBottom: '1px solid #262262',
        cursor: 'pointer'
    },
    genoMenuItemDisplay: {
        color: '#0079b8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    displayName: {
        fontSize: '1.5em'
    }
});

const styleCss = `
`;

export const GenomicViewComponent = withRouteData(class extends React.Component<{}, {}> {
       render() {
        const tabIndex = 0;
        return <React.Fragment>
                <style>{styleCss}</style>
                <div className='gene-container'>
                    <h1>Genomic Data</h1>
                    <div>
                    This section provides an overview of genomic data within the current <i>All of Us</i> dataset.
                    Researchers can use the Participants with Genomic Data page to view currently available genomic data by
                    participant-reported race/ethnicity, sex assigned at birth, and age. The Variant Search can be used for
                    preliminary exploration of genetic variant allele frequencies by with select annotations and genetic
                    ancestry associations.
                     </div>
                    <div className='geno-layout' style={styles.genoLayout}>
                        <div className='geno-menu' style={styles.genoMenuItem}>
                            <div className='geno-menu-item-container' style={styles.genoMenuItemContainer}>
                                <div tabIndex={tabIndex} style={styles.genoMenuItem}>
                                    <div className='geno-menu-item-display' style={styles.genoMenuItemDisplay}>
                                    <span style={styles.displayName}>Participants with Genomic Data</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
               </React.Fragment>;
       }
});
