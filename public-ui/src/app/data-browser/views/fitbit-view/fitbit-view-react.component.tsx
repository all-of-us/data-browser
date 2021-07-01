import {withRouteData} from 'app/components/app-router';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { ChartFitbitReactComponent } from 'app/data-browser/charts/chart-fitbit/chart-fitbit-react.component';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { fitbitConcepts } from 'app/utils/constants';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';

const styles = reactStyles({
    fmLayout: {
        display: 'grid',
        gridTemplateColumns: '20% 80%',
        columnGap: '0.5rem'
    },
    fmBody: {
        background: 'white',
        borderRadius: '3px',
        padding: '2rem',
        paddingTop: '0'
    },
    fas: {
        paddingRight: '0.25em',
        fontSize: '2em'
    },
    fmMenuItemDisplay: {
        color: '#0079b8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    fmMenuItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        fontSize: '0.8em',
        /* border-bottom: 1px solid #262262 ; */
        cursor: 'pointer'
    },
    fmMenuItemActive: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem',
        fontSize: '0.8em',
        /* border-bottom: 1px solid #262262 ; */
        cursor: 'pointer',
        background: '#dae6ed',
        borderRadius: '3px',
        fontFamily: 'GothamBold'
    },
    selectedDisplayH: {
        paddingBottom: '1rem',
        textTransform: 'capitalize'
    },
    fmBodyTop: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    fmBodyBottom: {
        paddingTop: '1rem',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    },
    fmBottomChart: {
        background: '#216fb40d',
        padding: '1rem',
        borderRadius: '3px',
        minWidth: '15rem',
        paddingTop: '1rem',
        width: '100%'
    },
    fmMenuItemContainer: {
        padding: '0.25rem 0rem',
        borderBottom: '1px solid #262262',
        cursor: 'pointer'
    },
    chartDisplayBody: {
        paddingBottom: '1rem'
    },
    fmChart: {
        background: '#216fb40d',
        width: 'calc(50% - 0.5rem)',
        padding: '1rem',
        borderRadius: '3px',
        minWidth: '15rem'
    }
});

const styleCss = `
.fm-menu-item-display span::first-letter {
    text-transform: uppercase;
}

@media (max-width: 900px) {
    .fm-body-top .fm-chart {
        width: 100%;
    }
    .fm-body-top .fm-chart:last-of-type {
        width: 100%;
        margin-top: 1rem;
    }
}
`;

interface State {
    concepts: any;
    domainCountAnalysis: any;
    totalCountAnalysis: any;
    searchText: string;
    selectedItem: any;
    selectedDisplay: any;
    selectedAnalyses: any;
    loading: boolean;
}

export const FitbitReactComponent = withRouteData(class extends React.Component<{}, State> {
  constructor(props) {
    super(props);
    this.state = {concepts: fitbitConcepts, domainCountAnalysis: null, totalCountAnalysis: null, searchText: localStorage.getItem('searchText'), selectedItem: 'any Fitbit data',
    selectedDisplay: 'any Fitbit data', selectedAnalyses: null, loading: true};
  }

  componentDidMount() {
    this.getFitbitData();
    this.getCountData();
  }

  getFitbitData() {
    const {concepts} = this.state;
    const FITBIT_MEASUREMENTS = ['Any Fitbit Data', 'Heart Rate (Summary)', 'Heart rate (minute-level)', 'Activity (daily summary)', 'Activity intraday steps (minute-level)'];
    dataBrowserApi().getFitbitAnalysisResults(FITBIT_MEASUREMENTS).then(
      (result) => {
        const items = result.items;
        let totalCountAnalysis = null;
        for (const item of result.items) {
            const fitbitConcept = concepts.filter(concept =>
              concept.conceptName.toLowerCase().includes(item.conceptId.toLowerCase()))[0];
            fitbitConcept['ageAnalysis'] = item.ageAnalysis;
            fitbitConcept['genderAnalysis'] = item.genderAnalysis;
            fitbitConcept['countAnalysis'] = item.countAnalysis;
            totalCountAnalysis = item.countAnalysis;
            fitbitConcept['participantCountAnalysis'] = item.participantCountAnalysis;
       }
       let selectedItem = this.state.selectedItem;
       let selectedDisplay = this.state.selectedDisplay;
       let selectedAnalyses = result.items[0];
       if (this.state.searchText) {
        const matchingConcepts = concepts.filter(concept =>
                     concept.conceptName.toLowerCase().includes(this.state.searchText.toLowerCase()));
        if (matchingConcepts && matchingConcepts.length > 0) {
            selectedItem = matchingConcepts[0].conceptName;
            selectedDisplay = matchingConcepts[0].displayName;
            selectedAnalyses = matchingConcepts[0];
        }
       }
       this.setState({concepts: concepts, totalCountAnalysis: totalCountAnalysis, selectedItem: selectedItem, selectedDisplay: selectedDisplay, selectedAnalyses: selectedAnalyses, loading: false});
    });
  }

  getCountData() {
    dataBrowserApi().getCountAnalysis('Fitbit', 'fitbit').then(
        (result) => {
            this.setState({domainCountAnalysis: result});
    });
  }

  setGraphs(concept) {
    this.setState({selectedAnalyses: concept, selectedItem: concept.displayName, selectedDisplay: concept.displayName});
  }

  render() {
    const {concepts, searchText, selectedItem, selectedDisplay, selectedAnalyses, totalCountAnalysis, domainCountAnalysis, loading} = this.state;
    let tabIndex = 0;
    let selectedResult = null;
    return <React.Fragment>
        <style>{styleCss}</style>
        <div className='fm-container'>
            <h1>Fitbit Data</h1>
            {loading && <Spinner />}
            {!loading &&
            <div className='fm-layout' style={styles.fmLayout}>
                <div className='fm-menu'>
                    { concepts && concepts.map((concept, index) => {
                        let iconClass = 'fas ' + concept.icon;
                        let conceptClass = selectedItem.toLowerCase() === concept.displayName.toLowerCase() ? styles.fmMenuItemActive : styles.fmMenuItem;
                        return <div className='fm-menu-item-container' style={styles.fmMenuItemContainer} key={index}>
                            <div tabIndex={tabIndex} style={conceptClass} onClick={() => this.setGraphs(concept)}>
                                <i className={iconClass} style={styles.fas}></i>
                                <div className='fm-menu-item-display' style={styles.fmMenuItemDisplay}><span>{concept.displayName}</span>
                                    <TooltipReactComponent tooltipKey={concept.tooltipKey} label='Fitbit concept Hover' searchTerm={searchText} action='Fitbit concept hover'/>
                                </div>
                            </div>
                        </div>;
                    })
                    }
                </div>
                <div className='fm-body' style={styles.fmBody}>
                    <h2 style={styles.selectedDisplayH}>{selectedDisplay} </h2>
                    <div className='fm-body-top' style={styles.fmBodyTop}>
                        <div className='fm-chart' style={styles.fmChart}>
                            <div className='display-body' style={styles.chartDisplayBody}>Participants with {selectedDisplay}</div>
                            {selectedAnalyses && totalCountAnalysis &&
                                <ChartFitbitReactComponent concepts={selectedAnalyses.participantCountAnalysis} countAnalysis={totalCountAnalysis}/>
                            }
                        </div>
                        <div className='fm-chart' style={styles.fmChart}>
                        <div className='display-body' style={styles.chartDisplayBody}>Sex assigned at birth</div>
                        {selectedAnalyses && totalCountAnalysis && domainCountAnalysis &&
                        <BioSexChartReactComponent genderAnalysis={selectedAnalyses.genderAnalysis} genderCountAnalysis={domainCountAnalysis.genderCountAnalysis}
                                                domain='fitbit' selectedResult={selectedResult}/>
                        }
                        </div>
                    </div>
                    <div className='fm-body-bottom' style={styles.fmBodyBottom}>
                        <div className='fm-chart' style={styles.fmBottomChart}>
                            <div className='display-body' style={styles.chartDisplayBody}>Age when physical measurement taken</div>
                            {selectedAnalyses && domainCountAnalysis &&
                                <AgeChartReactComponent ageAnalysis={selectedAnalyses.ageAnalysis}
                                ageCountAnalysis={domainCountAnalysis.ageCountAnalysis} domain='fitbit' selectedResult={selectedResult}/>
                            }
                        </div>
                    </div>
                </div>
            </div>
            }
        </div>
      </React.Fragment>;
    }
});
