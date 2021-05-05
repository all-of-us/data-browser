import { Component } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { reactStyles } from 'app/utils/index';
import { GENDER_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { FunctionComponent } from 'react';
import { Spinner } from 'app/utils/spinner';
import {ValueReactChartComponent} from 'app/data-browser/charts/chart-measurement-values/chart-value-react.component';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';

import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';

const styles = reactStyles({
    pmContainer : {
        margin: '1.2em'
    },
    active: {
        fontWeight: 900
    }
});

const PMConcept = {
    conceptId: '',
    conceptName: '',
    analyses: null,
    chartType: ''
}

const PMConceptGroups = {
    group: '',
    groupName: '',
    concepts: []
}

let PMGroups = [];

const styleCss = `
aside {
    padding-right: 18px;
    display: block;
}
.db-card {
    width: 100%;
}
.pm-layout {
    display: flex;
}
.btn-link {
    font-size: 14px;
    color: #0077b7;
}
.active {
    font-weight: 900;
}
.chart-layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-top: 1em;
}
.bs-chart-item {
    width: calc((33.3%) - 18px);
    height: auto;
    flex-grow: 1;
}
.group-option {
    width: 100%;
    display: flex;
    justify-content: center;
}
.group-unit {
    display: flex;
    justify-content: center;
}
.unit-button {
    padding-right: 0.5em;
}
.unit-button.active, .concept-button.active {
    border-bottom: 4px solid #216fb4;
}
.group-button.active {
    font-weight: 3em;
    border: 2px solid #216fb4;
}
.participant-count {
    width: 100%;
    text-align: center;
    padding-bottom: 18px
}
aside .button-item button {
    font-size: 0.8em;
}
@media (max-width: 550px) {
    .db-card {
        overflow-x: scroll;
    }
}
.group-name {
    font-size: 1.4em;
    white-space: nowrap;
    width: fit-content;
    padding: 1em;
    padding-top: .5em;
}
.bs-title {
    padding-top: 1em;
    padding-left: 1.5em;
}

.chart-item {
    width: calc((50%) - 18px);
    height: auto;
    flex-grow: 1;
}
.age-chart {
    padding: 1em;
    padding-left: 1.5em;
    margin: 0;
}

.chart-item:last-of-type {
    width: 100%;
    max-width: calc((100%) - 18px);
    min-width: 20rem;
}

@media (max-width: 978px) {
    .pm-layout {
        flex-direction: column;
    }
    aside {
        flex-wrap: wrap;
        display: flex;
        justify-content: space-between;
        margin: -1em;
        margin-bottom: 0px
    }
    aside .button-item {
        padding: 18px;
        padding-top: 0;
    }
    .chart-item {
        width: 100%;
        height: auto;
    }
}
`;

const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

interface State {
    loading: boolean;
    selectedGroup: any;
    selectedConcept: any;
    selectedConceptUnit: any;
    selectedConceptValueAnalysis: any;
    selectedConceptValueCountAnalysis: any;
    domainCountAnalysis: any;
    searchText: any;
    unitNames: Array<String>;
}

interface Props {
}

export class pmReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    PMGroups = [];
    PMGroups.push({group: 'blood-pressure', groupName: 'Mean Blood Pressure', concepts: [
    {conceptId: '903118', conceptName: 'Systolic', chartType: 'histogram', analyses: []},
    {conceptId: '903115', conceptName: 'Diastolic', chartType: 'histogram', analyses: []}
    ]});
    PMGroups.push({group: 'height', groupName: 'Height', concepts: [
    {conceptId: '903133', conceptName: 'Height', chartType: 'histogram', analyses: []}
    ]});
    PMGroups.push({group: 'weight', groupName: 'Weight', concepts: [
    {conceptId: '903121', conceptName: 'Weight', chartType: 'histogram', analyses: []}
    ]});
    PMGroups.push({group: 'mean-waist', groupName: 'Mean waist circumference', concepts: [
    {conceptId: '903135', conceptName: 'Mean waist circumference', chartType: 'histogram', analyses: []}
    ]});
    PMGroups.push({group: 'mean-hip', groupName: 'Mean hip circumference', concepts: [
    {conceptId: '903136', conceptName: 'Mean hip circumference', chartType: 'histogram', analyses: []}
    ]});
    PMGroups.push({group: 'mean-heart-rate', groupName: 'Mean heart rate', concepts: [
    {conceptId: '903126', conceptName: 'Mean heart rate', chartType: 'histogram', analyses: []}
    ]});
    PMGroups.push({group: 'wheel-chair', groupName: 'Wheel chair use', concepts: [
    {conceptId: '903111', conceptName: 'Wheel chair use', chartType: 'column', analyses: []}
    ]});
    PMGroups.push({group: 'pregnancy', groupName: 'Pregnancy', concepts: [
    {conceptId: '903120', conceptName: 'Pregnancy', chartType: 'column', analyses: []}
    ]});
    this.state = {loading: true, searchText: localStorage.getItem('searchText'), selectedGroup: PMGroups[0], selectedConcept: PMGroups[0].concepts[0], selectedConceptUnit: null, domainCountAnalysis: null, selectedConceptValueAnalysis: null, selectedConceptValueCountAnalysis: null, unitNames: []};
  }

  componentDidMount() {
        this.getPMData();
        this.getPMCountData();
  }

  getPMData() {
    const {searchText} = this.state;
    const PM_CONCEPTS = ['903118', '903115', '903133', '903121', '903135', '903136', '903126', '903111', '903120'];
    api.getConceptAnalysisResults(PM_CONCEPTS).then(
        (result) => {
            const items = result.items;
            for(let group of PMGroups) {
                for(let concept of group.concepts) {
                    concept.analyses = items.filter(item => item.conceptId === concept.conceptId)[0];
                    if (concept.conceptId === '903133') {
                    const sortOrder = ['centimeter', 'inch (us)'];
                    concept.analyses.measurementGenderCountAnalysis
                        .sort((a, b) => {
                            return sortOrder.indexOf(a.unitName.toLowerCase()) -
                                sortOrder.indexOf(b.unitName.toLowerCase());
                        });
                    }
                    this.arrangeConceptAnalyses(concept);
                    this.setState({loading: false});
                }
            }
            if (searchText) {
                this.setState({selectedGroup: PMGroups.filter(conceptgroup =>
                          conceptgroup.groupName.toLowerCase().
                            includes(searchText.toLowerCase()))[0]});
            } else {
                this.setState({selectedGroup: PMGroups[0]});
            }
            this.setUnit(PMGroups[0].concepts[0])
    });
  }

  getPMCountData() {
    api.getCountAnalysis('Physical Measurements', 'pm').then(
        (result) => {
            this.setState({domainCountAnalysis: result});
    });
  }

  organizeGenders(concept: any) {
    const analysis = concept.analyses.genderAnalysis;
    let male = null;
    let female = null;
    let other = null;

    // No need to do anything if only one gender
    if (analysis.results.length <= 1) {
      return;
    }
    const results = [];
    for (const g of analysis.results) {
      if (g.stratum2 === '8507') {
        male = g;
      } else if (g.stratum2 === '8532') {
        female = g;
      } else if (g.stratum2 === '0') {
        other = g;
      }
    }

    // Order genders how we want to display  Male, Female , Others
    if (male) { results.push(male); }
    if (female) { results.push(female); }
    if (other) { results.push(other); }
    analysis.results = results;
  }

  setAnalysisStratum(results: any) {
    for (const r of results) {
      if (r.analysisStratumName === null) {
        r.analysisStratumName = GENDER_STRATUM_MAP[r.stratum3];
      }
    }
  }

  arrangeConceptAnalyses(concept: any) {
    if (concept.analyses.genderAnalysis) {
      this.organizeGenders(concept);
    }

    let genders = ['8507', '8532', '0'];
    let prevResult;
    for (const gca of concept.analyses.measurementGenderCountAnalysis) {
      if (gca.results.length < 3) {
        for (const result of gca.results) {
          prevResult = result;
          genders = genders.filter(item => item !== result.stratum3);
        }
        for (const gender of genders) {
          const missingResult = { ...prevResult };
          missingResult.stratum3 = gender;
          missingResult.countValue = 20;
          missingResult.sourceCountValue = 20;
          gca.results.push(missingResult);
        }
      }
      this.setAnalysisStratum(gca.results);
    }
  }

  showMeasurement(pmConceptGroup: any, concept: any) {
    this.setUnit(concept);
    this.setState({selectedGroup: pmConceptGroup, selectedConcept: concept});
  }

  setUnit(concept: any) {
    let unitNames = [];
    if (concept.analyses && concept.analyses.measurementGenderCountAnalysis) {
          for (const r of concept.analyses.measurementGenderCountAnalysis) {
            let tempUnitNames = r.results.map(({ stratum2 }) => stratum2);
            tempUnitNames = tempUnitNames.filter((elem, index, self) => index === self.indexOf(elem));
            unitNames.push(...tempUnitNames);
          }
    }
    if (unitNames.length > 0) {
        this.setState({selectedConceptUnit: unitNames[0], unitNames: unitNames}, () => {
            this.setAnalysis();
        });
        return unitNames[0];
    }
    return null;
  }

  setConceptUnit(unit) {
    this.setState({selectedConceptUnit: unit}, () => {
        this.setAnalysis();
    });
  }



  setAnalysis() {
    const {selectedConcept, selectedConceptUnit} = this.state;
    if (['903120', '903111'].indexOf(selectedConcept.conceptId) === -1) {
      let temp = selectedConcept.analyses.measurementValueGenderAnalysis.filter(
        a => a.unitName.toLowerCase() ===
          selectedConceptUnit.toLowerCase());
      this.setState({selectedConceptValueAnalysis: temp[0]});
      temp = selectedConcept.analyses.measurementGenderCountAnalysis.filter(
        a => a.unitName.toLowerCase() ===
          selectedConceptUnit.toLowerCase());
      this.setState({selectedConceptValueCountAnalysis: temp[0]});
    }
  }

  getValueAnalysis() {
    const {selectedConceptValueAnalysis, selectedConcept} = this.state;
    if (!selectedConceptValueAnalysis) {
      return selectedConcept.analyses.measurementValueGenderAnalysis[0];
    }
    return selectedConceptValueAnalysis;
  }

  getCountAnalysis(conceptUnit: any) {
    const genderSort = ['Male', 'Female', 'Other'];
    return this.state.selectedConcept.analyses.measurementGenderCountAnalysis.filter(
      r => r.unitName === this.state.selectedConceptUnit)[0].results
      .sort((a, b) => {
        return genderSort.indexOf(a.analysisStratumName) -
          genderSort.indexOf(b.analysisStratumName);
      });
  }

  getChartTitle(gender) {
    return gender.analysisStratumName + ' - ' + (gender.countValue <= 20 ? '&le; ' : '') + gender.countValue.toLocaleString();
  }


  render() {
      return <React.Fragment>
      <style>{styleCss}</style>
      <div style={styles.pmContainer}>
        <h1>Browse Program Physical Measurements</h1>
        { this.state.loading ? <Spinner /> :
        <div className='pm-layout'>
            <aside>
                {
                    PMGroups.map((pmConceptGroup, index) => {
                        let buttonClass = this.state.selectedGroup === pmConceptGroup ? 'btn btn-link group-button active' : 'btn btn-link group-button';
                        return <div className='button-item' key={index}>
                        <button className={buttonClass} onClick={() => this.showMeasurement(pmConceptGroup, pmConceptGroup.concepts[0])}> {pmConceptGroup.groupName} </button></div>
                    })
                }
            </aside>
            <div className='db-card'>
                <div className='db-card-inner'>
                    <div className='db-card-header'>
                        <div className='group-name'>{this.state.selectedGroup.groupName}</div>
                        {   this.state.selectedConcept && this.state.selectedConcept.analyses && this.state.selectedConcept.analyses.measurementValueGenderAnalysis ?
                        <div className='bs-title'>
                        Sex Assigned At Birth <TooltipReactComponent tooltipKey='pmValueChartHelpText'
                                               label='Physical Measurements tooltip hover' searchTerm='TODO replace search text in here'
                                               action={'Hover on pm biological sex chart of concept' + this.state.selectedConcept.conceptName}>
                                               </TooltipReactComponent>
                        </div>
                        : null
                        }
                        { this.state.selectedGroup && this.state.selectedGroup.concepts && this.state.selectedGroup.concepts.length > 1 ?
                            <div className='group-option'>
                            {
                            this.state.selectedGroup.concepts.map((concept, index) => {
                                const btnClass = this.state.selectedConcept === concept ? 'btn btn-link concept-button active' : 'btn-link btn concept-button';
                                return <button className={btnClass} key={index} onClick={() => this.showMeasurement(this.state.selectedGroup, concept)}>{concept.conceptName}</button>
                            })
                            }
                            </div>
                        : null
                        }
                        </div>
                        {
                            this.state.unitNames && this.state.unitNames.length > 1 ?
                            <div className='group-unit'>
                            {
                                this.state.unitNames.map((unit, index) => {
                                    const btnClass = this.state.selectedConceptUnit === unit ? 'btn btn-link unit-button active' : 'btn btn-link unit-button';
                                    return <button className={btnClass} key={index} onClick={() => this.setConceptUnit(unit)}>{unit}</button>
                                })
                            }
                            </div> : null
                        }
                        {
                            this.state.selectedConcept && (this.state.selectedConcept.conceptId === '903111' || this.state.selectedConcept.conceptId === '903120') ?
                            this.state.selectedConcept.analyses.countAnalysis.results[0].countValue > 20 ?
                            <div className='participant-count'>
                            Total Participant count: {this.state.selectedConcept.analyses.countAnalysis.results[0].countValue}
                            </div> :
                            <div className='participant-count'>
                            Total Participant count: &le; {this.state.selectedConcept.analyses.countAnalysis.results[0].countValue}
                            </div> : null
                        }
                        <div className='chart-layout'>
                        {
                            this.state.selectedConcept && this.state.selectedConcept.analyses && this.state.selectedConcept.analyses.measurementGenderCountAnalysis ?
                            this.state.selectedConcept.conceptId !== '903111' && this.state.selectedConcept.conceptId !== '903120' && this.state.selectedConceptUnit ?
                            <React.Fragment>
                            {
                                this.getCountAnalysis(this.state.selectedConceptUnit).map((gender, index) => {
                                    const chartKey = gender.stratum3 + '-' + index;
                                    return <div className='bs-chart-item' key={chartKey}>
                                    <ValueReactChartComponent conceptId={this.state.selectedConcept.conceptId}
                                    valueAnalysis={this.getValueAnalysis()}
                                    domainCountAnalysis={this.state.domainCountAnalysis}
                                    genderId={gender.stratum3}
                                    chartTitle={gender.analysisStratumName + ' - ' + (gender.countValue <= 20 ? '&le; ' : '') + gender.countValue.toLocaleString()} key={chartKey}></ValueReactChartComponent></div>
                                })
                            }
                            </React.Fragment>
                            : this.state.selectedConcept.analyses.measurementValueGenderAnalysis ?
                                <div className='chart-item stacked-chart-item'>
                                <ValueReactChartComponent conceptId={this.state.selectedConcept.conceptId}
                                                          valueAnalysis={this.state.selectedConcept.analyses.measurementValueGenderAnalysis[0]}
                                                          domainCountAnalysis={this.state.domainCountAnalysis}
                                                          genderId='stacked gender'
                                                          chartTitle='stacked chart'>
                                </ValueReactChartComponent>
                              </div> : null
                            : null
                        }
                        {
                            this.state.selectedConcept.analyses && this.state.selectedConcept.analyses.ageAnalysis ?
                            <div className='chart-item age-chart'>
                                <div className='bs-title'>Age When Physical Measurement Was Taken <TooltipReactComponent tooltipKey='pmAgeChartHelpText'
                                    label='Physical Measurements tooltip hover'
                                    searchTerm='TODO replace search text in here'
                                    action={'Hover on pm age chart of concept ' + this.state.selectedConcept.conceptName}>
                                </TooltipReactComponent>
                                </div>
                                <AgeChartReactComponent ageAnalysis={this.state.selectedConcept.analyses.ageAnalysis} ageCountAnalysis={this.state.domainCountAnalysis.ageCountAnalysis} domain='pm' selectedResult=''>
                                </AgeChartReactComponent>
                            </div>
                             : null
                        }
                        </div>
                </div>
            </div>
        </div>
        }
      </div>
      </React.Fragment>;
    }
}



@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-pm',
    template: `<span #root></span>`,
})

export class PhysicalMeasurementsWrapperComponent extends BaseReactWrapper {
    constructor() {
        super(pmReactComponent, []);
    }
}
