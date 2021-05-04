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

import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';

const styles = reactStyles({
    pmContainer : {
        margin: '1.2em'
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

const PMGroups = [];

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
    padding-left: 1.5em;
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
}

interface Props {
}

export class pmReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
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
    this.state = {loading: true, selectedGroup: PMGroups[0], selectedConcept: PMGroups[0].concepts[0], selectedConceptUnit: this.setUnit(PMGroups[0].concepts[0]), selectedConceptValueAnalysis: null, selectedConceptValueCountAnalysis: null};
  }

  componentDidMount() {
        this.getPMData();
  }

  getPMData() {
    const PM_CONCEPTS = ['903118', '903115', '903133', '903121', '903135', '903136', '903126', '903111', '903120'];
    api.getConceptAnalysisResults(PM_CONCEPTS).then(
        (result) => {
            const items = result.items;
            for(let group of PMGroups) {
                for(let concept of group.concepts) {
                    concept.analyses = items.filter(item => item.conceptId === concept.conceptId)[0];
                    this.arrangeConceptAnalyses(concept);
                    this.setState({loading: false});
                }
            }
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
    this.setState({selectedGroup: pmConceptGroup, selectedConcept: concept});
  }

  setUnit(concept: any) {
    let unitNames = [];
    if (concept && concept.analyses && concept.analyses.measurementGenderCountAnalysis) {
          for (const r of concept.analyses.measurementGenderCountAnalysis) {
            let tempUnitNames = r.results.map(({ stratum2 }) => stratum2);
            tempUnitNames = tempUnitNames.filter((elem, index, self) => index === self.indexOf(elem));
            unitNames.push(...tempUnitNames);
          }
    }
    if (unitNames.length > 0) {
        this.setState({selectedConceptUnit: unitNames[0]}, () => {
            this.setAnalysis();
        });
        console.log(unitNames[0]);
        return unitNames[0];
    }
    return null;
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



  render() {
      return <React.Fragment>
      <style>{styleCss}</style>
      <div style={styles.pmContainer}>
        <h1>Browse Program Physical Measurements</h1>
        { this.state.loading ? <Spinner /> : null}
        <div className='pm-layout'>
            <aside>
                {
                    PMGroups.map((pmConceptGroup, index) => {
                        let buttonClass = this.state.selectedGroup === pmConceptGroup ? 'btn btn-link active' : 'btn btn-link';
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
                                               action='Hover on pm biological sex chart of concept'>
                                               </TooltipReactComponent>
                        </div>
                        : null
                        }

                        </div>
                </div>
            </div>
        </div>
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
