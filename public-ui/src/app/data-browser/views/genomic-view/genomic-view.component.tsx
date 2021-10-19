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
    selectionId: number
}



export const GenomicViewComponent = withRouteData(class extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            selectionId: 1
        }
    }
    sideBarItems = [
        {
            id: 1,
            label: 'Participants with Genomic Data'
        },
        {
            id: 2,
            label: 'Search Variants'
        },
        {
            id: 3,
            label: 'Genomics FAQ'
        },
    ]

    sideBarClick(selected: number) {
        this.setState({
            selectionId: selected
        })
    }
    render() {
        const { selectionId } = this.state;
        return <React.Fragment>
            <h1 style={styles.title}>Genomic Data</h1>
            <p style={globalStyles.bodyDefault}>This section provides an overview of genomic data within the current
                All of Us dataset. Researchers can use the Participants with Genomic
                Data page to view currently available genomic data by participant-reported
                for preliminary exploration of genetic variant allele frequencies by with select
                annotations and genetic ancestry associations.</p>
            <div style={styles.viewLayout}>
                <div style={styles.sideBarLayout}>
                    {this.sideBarItems.map((item,index) => {
                        return <div key={index} onClick={() => this.sideBarClick(item.id)}
                            style={{ ...selectionId == item.id && { ...styles.sideBarItemSelected }, ...styles.sideBarItem }}>
                            <span style={styles.sideBarItemText}>
                                {item.label}
                            </span>
                        </div>
                    })
                    }

                </div>
                <div>
                    {selectionId == 1 && <GenomicOverviewComponent />}
                    {selectionId == 2 && <GenomicSearchComponent />}
                </div>
            </div>

        </React.Fragment>;
    }
});
