import { withRouteData } from 'app/components/app-router';
import { GenomicOverviewComponent } from 'app/data-browser/views/genomic-view/components/genomic-overview.component';
import { reactStyles } from 'app/utils';
import * as React from 'react';
import { GenomicSearchComponent } from './components/genomic-search.component';
import { globalStyles } from 'app/utils/global-styles';
import { style } from '@angular/animations';
const styles = reactStyles({
    title: {
        margin: '0'
    },
    viewLayout: {
        display: 'grid',
        gridTemplateColumns: '185px 1fr',
        columnGap: '0.5rem',
        marginTop: '1em'
    },
    sideBarLayout: {
        color: '#0079b8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'

    },
    sideBarItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        fontSize: '0.8em',
        width: '100%',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(38, 34, 98, .25)'
    },
    sideBarItemText: {
        width: '75%'
    },
    sideBarItemSelected: {
        background: 'red'
    }

});
// tslint:disable-next-line:no-empty-interface
interface State {
    selection: string
}



export const GenomicViewComponent = withRouteData(class extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            selection: 'GD'
        }
    }
    selection: string;

    sideBarClick(selected: string) {
        this.setState({
            selection: selected
        })
    }
    render() {
        const { selection } = this.state;
        return <React.Fragment>
            <h1 style={styles.title}>Genomic Data</h1>
            <p style={globalStyles.bodyDefault}>This section provides an overview of genomic data within the current
                All of Us dataset. Researchers can use the Participants with Genomic
                Data page to view currently available genomic data by participant-reported
                for preliminary exploration of genetic variant allele frequencies by with select
                annotations and genetic ancestry associations.</p>
            <div style={styles.viewLayout}>
                <div style={styles.sideBarLayout}>
                    <div onClick={() => this.sideBarClick('GD')}
                        style={{ ...selection == 'GD' && { ...styles.sideBarItemSelected }, ...styles.sideBarItem }}>
                        <span style={styles.sideBarItemText}>
                            Participants with Genomic Data
                        </span>
                    </div>
                    <div onClick={() => this.sideBarClick('GS')}
                        style={{ ...selection == 'GS' && { ...styles.sideBarItemSelected }, ...styles.sideBarItem }}>
                        <span style={styles.sideBarItemText}>Search Variants</span>
                    </div>
                    <div onClick={() => this.sideBarClick('FAQ')}
                        style={{ ...selection == 'FAQ' && { ...styles.sideBarItemSelected }, ...styles.sideBarItem }}>
                        <span style={styles.sideBarItemText}>Genomic FAQs</span>
                    </div>
                </div>
                <div>
                    {selection == 'GD' && <GenomicOverviewComponent />}
                    {selection == 'GS' && <GenomicSearchComponent />}
                </div>
            </div>

        </React.Fragment>;
    }
});
