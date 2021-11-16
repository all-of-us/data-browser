import { withRouteData } from 'app/components/app-router';
import { GenomicOverviewComponent } from 'app/data-browser/views/genomic-view/components/genomic-overview.component';
import { reactStyles } from 'app/utils';
import { globalStyles } from 'app/utils/global-styles';
import * as React from 'react';
import { GenomicFaqComponent } from './components/genomic-faq.component';
import { GenomicSearchComponent } from './components/genomic-search.component';

const styles = reactStyles({
    title: {
        margin: '0'
    },
    viewLayout: {
        display: 'grid',
        gridTemplateColumns: '185px 85%',
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
    sideBarItemConainer: {
        paddingBottom: '.25rem',
        borderBottom: '1px solid rgba(38, 34, 98, .25)',
        width: '100%'
    },
    sideBarItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        paddingBottom: '0',
        fontSize: '0.8em',
        width: '100%',
        cursor: 'pointer',
        margin: '0.5rem'
    },
    sideBarItemText: {
        width: '75%'
    },
    sideBarItemSelected: {
        background: 'red',
        borderRadius: '3px',
        fontFamily: 'GothamBold, Arial, Helvetica, sans-serif',
        fontWeight: 'bolder',
        backgroundColor: 'rgba(33,111,180,0.15)'
    },
    faqHeading: {
        fontSize: '0.8em',
        color: 'rgb(38, 34, 98)',
        align: 'center',
        padding: '0.5rem',
        margin: '0.5rem',
        marginTop: '2em',
    },
    faqLink: {
        color: '#0079b8',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
    }
});

interface State {
    selectionId: number;
}

const css = `
`;

export const GenomicViewComponent = withRouteData(class extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            selectionId: 1
        };
    }

    sideBarItems = [
        {
            id: 1,
            label: 'Participant Demographics'
        },
        {
            id: 2,
            label: 'Variant Search'
        }
    ];
    title = 'Genomic Data';

    sideBarClick(selected: number) {
        // if (selected === 3) {
        //     document.getElementById('sideBar').style.filter = 'blur(2px)';
        //     document.getElementById('genomicTitle').style.filter = 'blur(2px)';
        // } else {
        //     this.resetFilters();
        // }
        this.setState({
            selectionId: selected
        });
    }

    resetFilters() {
        document.getElementById('sideBar').style.filter = '';
        document.getElementById('genomicTitle').style.filter = '';
    }

    handleFaqClose() {
        this.setState({selectionId: 2});
        this.resetFilters();
    }

    render() {
        const { selectionId } = this.state;
        return <React.Fragment>
            <style>{css}</style>
            <div id='genomicView'>
            <div id='genomicTitle'>
            <h1 style={styles.title}>{this.title}</h1>
            <p style={globalStyles.bodyDefault}>
                This section provides an overview of genomic data within the current
                <i> All of Us</i> dataset.Researchers can use the Participants with Genomic
                Data page to view currently available genomic data by participant - reported
                for preliminary exploration of genetic variant allele frequencies by with select
                annotations and genetic ancestry associations.
            </p>
            </div>
            <div style={styles.viewLayout}>
                <div style={styles.sideBarLayout} id='sideBar'>
                    {this.sideBarItems.map((item, index) => {
                        return <div key={index} style={styles.sideBarItemConainer}>
                            <div onClick={() => this.sideBarClick(item.id)}
                                style={{ ...selectionId === item.id && { ...styles.sideBarItemSelected }, ...styles.sideBarItem }}>
                                <span style={styles.sideBarItemText}>
                                    {item.label}
                                </span>
                            </div>
                        </div>;
                    })
                    }
                    <div style={styles.faqHeading}>Questions about genomics?<br/><div style={styles.faqLink}
                    onClick={() => this.sideBarClick(3)}>Learn More</div></div>
                </div>
                <div id='childView'>
                    {selectionId === 1 && <GenomicOverviewComponent />}
                    {selectionId === 2 && <GenomicSearchComponent />}
                    {selectionId === 3 && <GenomicFaqComponent closed={() => this.handleFaqClose()} />}
                </div>
            </div>
        </div>
        </React.Fragment>;
    }
});
