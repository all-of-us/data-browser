import { Component } from '@angular/core';
import {withRouteData} from 'app/components/app-router';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { ChartFitbitReactComponent } from 'app/data-browser/charts/chart-fitbit/chart-fitbit-react.component';
import {ValueReactChartComponent} from 'app/data-browser/charts/chart-measurement-values/chart-value-react.component';
import { GENDER_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { fitbitConcepts } from 'app/utils/constants';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';

const styles = reactStyles({
});

const styleCss = `
.fm-layout {
    display: grid;
    grid-template-columns: 20% 80%;
    column-gap: 0.5rem;
}

.fm-body {
    background: white;
    border-radius: 3px;
    padding: 2rem;
    padding-top: 0;
}

.loading-layout {
    display: flex;
    justify-content: center;
    align-items: center;
}
.fm-body h2 {
    padding-bottom: 1rem;
    text-transform: capitalize;
}
.fm-body-top {
    display: flex;
    justify-content: space-between;
}
.fm-body-bottom {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
}
.fm-body-bottom .fm-chart {
    padding-top: 1rem;
    width: 100%;
}

.fm-chart {
    background: #216fb40d;
    width: calc(50% - 0.5rem);
    padding: 1rem;
    border-radius: 3px;
    min-width: 15rem;
}
.fm-chart .display-body {
    padding-bottom: 1rem;
}
.fm-menu-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    font-size: 0.8em;
    /* border-bottom: 1px solid #262262 ; */
    cursor: pointer;
}

.fm-menu-item-display span::first-letter {
    text-transform: uppercase;
}

.fm-menu-item-container {
    padding: 0.25rem 0rem;
    border-bottom: 1px solid #262262;
    cursor: pointer;
}

.active {
    background: #dae6ed;
    border-radius: 3px;
    font-family: GothamBold;
}
.fm-menu-item-display {
    color: #0079b8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.fas {
    padding-right: 0.25em;
    font-size: 2em;
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

interface Props {
}

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

export const FitbitReactComponent = withRouteData(class extends React.Component<Props, State> {
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
            <div className='fm-layout'>
                <div className='fm-menu'>
                    { concepts && concepts.map((concept, index) => {
                        let iconClass = 'fas ' + concept.icon;
                        let conceptClass = selectedItem.toLowerCase() === concept.displayName.toLowerCase() ? 'fm-menu-item active' : 'fm-menu-item';
                        return <div className='fm-menu-item-container' key={index}>
                            <div tabIndex={tabIndex} className={conceptClass} onClick={() => this.setGraphs(concept)}>
                                <i className={iconClass}></i>
                                <div className='fm-menu-item-display'><span>{concept.displayName}</span>
                                    <TooltipReactComponent tooltipKey={concept.tooltipKey} label='Fitbit concept Hover' searchTerm={searchText} action='Fitbit concept hover'/>
                                </div>
                            </div>
                        </div>;
                    })
                    }
                </div>
                <div className='fm-body db-card'>
                    <h2>{selectedDisplay} </h2>
                    <div className='fm-body-top'>
                        <div className='fm-chart'>
                            <div className='display-body'>Participants with {selectedDisplay}</div>
                            {selectedAnalyses && totalCountAnalysis &&
                                <ChartFitbitReactComponent concepts={selectedAnalyses.participantCountAnalysis} countAnalysis={totalCountAnalysis}/>
                            }
                        </div>
                        <div className='fm-chart'>
                        <div className='display-body'>Sex assigned at birth</div>
                        {selectedAnalyses && totalCountAnalysis && domainCountAnalysis &&
                        <BioSexChartReactComponent genderAnalysis={selectedAnalyses.genderAnalysis} genderCountAnalysis={domainCountAnalysis.genderCountAnalysis}
                                                domain='fitbit' selectedResult={selectedResult}/>
                        }
                        </div>
                    </div>
                    <div className='fm-body-bottom'>
                        <div className='fm-chart'>
                            <div className='display-body'>Age when physical measurement taken</div>
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
