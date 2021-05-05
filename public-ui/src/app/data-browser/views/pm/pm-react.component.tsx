import { Component } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import {ValueReactChartComponent} from 'app/data-browser/charts/chart-measurement-values/chart-value-react.component';
import { GENDER_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { reactStyles } from 'app/utils/index';
import { Spinner } from 'app/utils/spinner';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';

const styles = reactStyles({
    pmContainer : {
        margin: '1.2em'
    },
    aside: {
        paddingRight: '18px',
        display: 'block'
    },
    dbCard: {
        width: '100vw'
    },
    pmLayout: {
        display: 'flex'
    },
    btnLink: {
        fontSize: '14px',
        color: '#0077b7'
    },
    bsTitle: {
        paddingTop: '1em',
        paddingLeft: '1.5em'
    },
    chartLayout: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1em'
    }
});

let PMGroups = [];

const styleCss = `
.active {
    font-weight: 900;
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
    font-weight: 900;
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

export class PMReactComponent extends React.Component<{}, State> {
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
    this.state = {loading: true, searchText: localStorage.getItem('searchText'), selectedGroup: PMGroups[0],
    selectedConcept: PMGroups[0].concepts[0], selectedConceptUnit: null, domainCountAnalysis: null, selectedConceptValueAnalysis: null,
    selectedConceptValueCountAnalysis: null, unitNames: []};
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
            for (const group of PMGroups) {
                for (const concept of group.concepts) {
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
            this.setUnit(PMGroups[0].concepts[0]);
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
    const unitNames = [];
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
    const {selectedConcept, selectedConceptUnit} = this.state;
    const genderSort = ['Male', 'Female', 'Other'];
    return selectedConcept.analyses.measurementGenderCountAnalysis.filter(
      r => r.unitName === selectedConceptUnit)[0].results
      .sort((a, b) => {
        return genderSort.indexOf(a.analysisStratumName) -
          genderSort.indexOf(b.analysisStratumName);
      });
  }

  getChartTitle(gender) {
    return gender.analysisStratumName + ' - ' + (gender.countValue <= 20 ? '&le; ' : '') + gender.countValue.toLocaleString();
  }


  render() {
      const {loading, selectedGroup, selectedConcept, selectedConceptUnit, unitNames, domainCountAnalysis} = this.state;
      return <React.Fragment>
      <style>{styleCss}</style>
      <div style={styles.pmContainer}>
        <h1>Browse Program Physical Measurements</h1>
        { loading ? <Spinner /> :
        <div className='pm-layout' style={styles.pmLayout}>
            <aside style={styles.aside}>
                {
                    PMGroups.map((pmConceptGroup, index) => {
                        const buttonClass = (selectedGroup === pmConceptGroup) ? 'btn btn-link group-button active' : 'btn btn-link group-button';
                        return <div className='button-item' key={index}>
                        <button className={buttonClass} style={styles.btnLink}
                        onClick={() => this.showMeasurement(pmConceptGroup, pmConceptGroup.concepts[0])}> {pmConceptGroup.groupName}
                        </button>
                        </div>
                    });
                }
            </aside>
            <div className='db-card' style={styles.dbCard}>
                <div className='db-card-inner'>
                    <div className='db-card-header'>
                        <div className='group-name'>{selectedGroup.groupName}</div>
                        {   selectedConcept && selectedConcept.analyses && selectedConcept.analyses.measurementValueGenderAnalysis ?
                        <div className='bs-title' style={styles.bsTitle}>
                        Sex Assigned At Birth <TooltipReactComponent tooltipKey='pmValueChartHelpText'
                                               label='Physical Measurements tooltip hover' searchTerm='TODO replace search text in here'
                                               action={'Hover on pm biological sex chart of concept' + selectedConcept.conceptName}>
                                               </TooltipReactComponent>
                        </div>
                        : null
                        }
                        { selectedGroup && selectedGroup.concepts && selectedGroup.concepts.length > 1 ?
                            <div className='group-option'>
                            {
                            selectedGroup.concepts.map((concept, index) => {
                                const btnClass = selectedConcept === concept ? 'btn btn-link concept-button active' : 'btn-link btn concept-button';
                                return <button className={btnClass} key={index}
                                onClick={() => this.showMeasurement(selectedGroup, concept)} style={styles.btnLink}>{concept.conceptName}</button>
                            });
                            }
                            </div>
                        : null
                        }
                        </div>
                        {
                            unitNames && unitNames.length > 1 ?
                            <div className='group-unit'>
                            {
                                unitNames.map((unit, index) => {
                                    const btnClass = selectedConceptUnit === unit ? 'btn btn-link unit-button active' : 'btn btn-link unit-button';
                                    return <button className={btnClass} key={index}
                                    onClick={() => this.setConceptUnit(unit)} style={styles.btnLink}>{unit}</button>
                                });
                            }
                            </div> : null
                        }
                        {
                            selectedConcept && (selectedConcept.conceptId === '903111' || selectedConcept.conceptId === '903120') ?
                            selectedConcept.analyses.countAnalysis.results[0].countValue > 20 ?
                            <div className='participant-count'>
                            Total Participant count: {selectedConcept.analyses.countAnalysis.results[0].countValue}
                            </div> :
                            <div className='participant-count'>
                            Total Participant count: &le; {selectedConcept.analyses.countAnalysis.results[0].countValue}
                            </div> : null
                        }
                        <div className='chart-layout' style={styles.chartLayout}>
                        {
                            selectedConcept && selectedConcept.analyses && selectedConcept.analyses.measurementGenderCountAnalysis ?
                            selectedConcept.conceptId !== '903111' && selectedConcept.conceptId !== '903120' && selectedConceptUnit ?
                            <React.Fragment>
                            {
                                this.getCountAnalysis(selectedConceptUnit).map((gender, index) => {
                                    const chartKey = gender.stratum3 + '-' + index;
                                    return <div className='bs-chart-item' key={chartKey}>
                                    <ValueReactChartComponent conceptId={selectedConcept.conceptId}
                                    valueAnalysis={this.getValueAnalysis()}
                                    domainCountAnalysis={domainCountAnalysis}
                                    genderId={gender.stratum3}
                                    chartTitle={gender.analysisStratumName + ' - ' + (gender.countValue <= 20 ? '&le; ' : '') + gender.countValue.toLocaleString()} key={chartKey}></ValueReactChartComponent></div>
                                })
                            }
                            </React.Fragment>
                            : selectedConcept.analyses.measurementValueGenderAnalysis ?
                                <div className='chart-item stacked-chart-item'>
                                <ValueReactChartComponent conceptId={selectedConcept.conceptId}
                                                          valueAnalysis={selectedConcept.analyses.measurementValueGenderAnalysis[0]}
                                                          domainCountAnalysis={domainCountAnalysis}
                                                          genderId='stacked gender'
                                                          chartTitle='stacked chart'>
                                </ValueReactChartComponent>
                              </div> : null
                            : null
                        }
                        {
                            selectedConcept.analyses && selectedConcept.analyses.ageAnalysis ?
                            <div className='chart-item age-chart'>
                                <div className='bs-title' style={styles.bsTitle}>Age When Physical Measurement Was Taken <TooltipReactComponent
                                    tooltipKey='pmAgeChartHelpText'
                                    label='Physical Measurements tooltip hover'
                                    searchTerm='TODO replace search text in here'
                                    action={'Hover on pm age chart of concept ' + selectedConcept.conceptName}>
                                </TooltipReactComponent>
                                </div>
                                <AgeChartReactComponent ageAnalysis={selectedConcept.analyses.ageAnalysis}
                                ageCountAnalysis={domainCountAnalysis.ageCountAnalysis} domain='pm' selectedResult=''>
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
        super(PMReactComponent, []);
    }
}
