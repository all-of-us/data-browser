import {
  Component,
  Input
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { ValueReactChartComponent } from 'app/data-browser/charts/chart-measurement-values/chart-value-react.component';
import { SourcesChartReactComponent } from 'app/data-browser/charts/chart-sources/chart-sources-react.component';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ErrorMessageReactComponent } from 'app/data-browser/views/error-message/error-message-react.component';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { GraphType } from 'app/utils/enum-defs';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';

const cssStyles = `
.source-layout {
    display: flex;
    margin: 0 2rem;
    height: 100%;
    flex-direction: row;
}

.sources-chart {
  width: 100%;
  margin-left: -1rem;
  background: white;
}

.concept-box-info {
    padding: .5rem;
    text-align: left;
}

.concept-box-info p {
    font-size: 14px;
    color: #262262;
    margin-top: 0;
    line-height: 1.5;
}

.unit-choice.active {
  border-style: solid;
  border-color: #bee1ff;
  border-radius: 2px 2px 2px 2px;
}

.measurement-filter-choice.active {
  text-decoration: underline;
}

.measurement-filter-choice {
  color: #262262;
}

.ehr-m-chart-layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-top: 1em;
}

.ehr-m-chart-item {
    width: calc((33.3%) - 18px);
    height: auto;
    flex-grow: 1;
}
`;

interface State {
  graphButtons: any;
  graphToShow: string;
  selectedChartAnalysis: any;
  countAnalysis: any;
  isAnalysisLoaded: boolean;
  displayGraphErrorMessage: boolean;
  measurementGenderCountAnalysis: any;
  selectedMeasurementType: string;
  mixtureOfValues: boolean;
  noUnitValueButtons: any;
  conceptAnalyses: any;
  selectedUnit: string;
  sourceConcepts: any;
  unitNames: any;
  genderResults: any;
  toDisplayMeasurementGenderAnalysis: any;
  loading: boolean;
  toDisplayMeasurementGenderCountAnalysis: any;
}

interface Props {
    concept: any;
    domain: any;
    searchTerm: any;
}

export class ConceptChartReactComponent extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
          graphButtons: this.props.domain === 'labs & measurements' ? ['Values', 'Sex Assigned at Birth', 'Age', 'Sources'] : ['Sex Assigned at Birth', 'Age', 'Sources'],
          graphToShow: this.props.domain === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex,
          displayGraphErrorMessage: false,
          selectedChartAnalysis: null,
          conceptAnalyses: null,
          countAnalysis: null,
          sourceConcepts: null,
          measurementGenderCountAnalysis: null,
          selectedUnit: null,
          unitNames: [],
          selectedMeasurementType: null,
          toDisplayMeasurementGenderAnalysis: null,
          toDisplayMeasurementGenderCountAnalysis: null,
          isAnalysisLoaded: false,
          mixtureOfValues: false,
          noUnitValueButtons: ['No Unit (Text)', 'No Unit (Numeric)'],
          genderResults: null,
          loading: true
        };
    }

    componentDidMount() {
        const {concept, domain} = this.props;
        dataBrowserApi().getConceptAnalysisResults(
          [concept.conceptId.toString()], concept.domainId
        ).then(results => {
            this.setState({
                conceptAnalyses: results.items[0],
                displayGraphErrorMessage: false,
                selectedChartAnalysis: domain === 'labs & measurements' ?
                results.items[0].measurementValueGenderAnalysis : results.items[0].genderAnalysis,
                measurementGenderCountAnalysis: domain === 'labs & measurements' ?
                results.items[0].measurementGenderCountAnalysis : null,
                isAnalysisLoaded: true,
                loading: false
            }, () => {
                this.prepMeasurementChartData();
            });
        }).catch(e => {
            console.log(e, 'error');
            this.setState({
                displayGraphErrorMessage: true,
                isAnalysisLoaded: true,
            });
        });
        dataBrowserApi().getCountAnalysis(concept.domainId, 'ehr')
        .then(results => {
            this.setState({
                countAnalysis: results,
            });
        }).catch(e => {
            console.log(e, 'error');
        });
        dataBrowserApi().getSourceConcepts(concept.conceptId)
        .then(results => {
            const sources = results.items.length > 10 ? results.items.slice(0, 10) : results.items;
            this.setState({
                sourceConcepts: sources
            });
        }).catch(e => {
            console.log(e, 'error');
        });
    }

    selectGraphType(g) {
        const {conceptAnalyses} = this.state;
        let selectedAnalysis;
        let measurementGenderCountAnalysis;
        switch (g) {
            case GraphType.Age:
                selectedAnalysis = conceptAnalyses.ageAnalysis;
                break;
            case GraphType.Sources:
                selectedAnalysis = null;
                break;
            case GraphType.Values:
                selectedAnalysis = conceptAnalyses.measurementValueGenderAnalysis;
                measurementGenderCountAnalysis = conceptAnalyses.measurementGenderCountAnalysis;
                break;
            default:
                selectedAnalysis = conceptAnalyses.genderAnalysis;
                break;
        }

        this.setState({
            graphToShow: g,
            selectedChartAnalysis: selectedAnalysis,
            measurementGenderCountAnalysis: measurementGenderCountAnalysis,
            displayGraphErrorMessage: selectedAnalysis === undefined
        }, () => {
             this.prepMeasurementChartData();
         });
    }

    prepMeasurementChartData() {
        const {graphToShow, measurementGenderCountAnalysis, conceptAnalyses} = this.state;
        if (graphToShow === 'Values') {
            const genderResults = conceptAnalyses.genderAnalysis.results;
            const chartGenderOrder = ['8507', '8532', '0'];
            genderResults.sort((a, b) => {
                return chartGenderOrder.indexOf(a.stratum2) - chartGenderOrder.indexOf(b.stratum2);
            });
            const unitCounts = [];
            for (const aa of measurementGenderCountAnalysis) {
                      let sumCount = 0;
                      for (const ar of aa.results) {
                        sumCount = sumCount + ar.countValue;
                      }
                      unitCounts.push({ name: aa.unitName, count : sumCount});
            }
            unitCounts.sort((a, b) => {
                return a.count - b.count;
            });
            let unitNames = unitCounts.map(d => d.name);
            const noUnit = unitNames.filter(n => n.toLowerCase() === 'no unit');
            unitNames = unitNames.filter(n => n.toLowerCase() !== 'no unit');
            if (noUnit.length > 0) {
                unitNames.push(noUnit[0]);
            }
            if (unitNames.length > 0) {
                    this.setState({
                        selectedUnit: unitNames[0],
                        unitNames: unitNames,
                        genderResults: genderResults
                    }, () => {
                        this.showMeasurementGenderHistogram(unitNames[0]);
                    });
            }
        }
        return;
    }

    showMeasurementGenderHistogram(unit: string) {
        const {selectedChartAnalysis, measurementGenderCountAnalysis} = this.state;
        let mixtureOfValues = false;
        if (unit.toLowerCase() === 'no unit') {
            const unitResults = selectedChartAnalysis.find(aa => aa.unitName === unit);
            if (unitResults && unitResults.results && unitResults.results.length > 0) {
                const numericResults = unitResults.results.filter(r => r.measurementValueType === 'numeric');
                const textResults = unitResults.results.filter(r => r.measurementValueType === 'text');
                if (numericResults && numericResults.length > 0 && textResults && textResults.length > 0) {
                    mixtureOfValues = true;
                }
            }
        }
        let toDisplayMeasurementGenderAnalysis = { ...selectedChartAnalysis.find(aa => aa.unitName === unit) };
        let toDisplayMeasurementGenderCountAnalysis = null;
        if (measurementGenderCountAnalysis) {
            toDisplayMeasurementGenderCountAnalysis = measurementGenderCountAnalysis.find(aa => aa.unitName === unit);
        }
        let selectedMeasurementType = null;
        if (mixtureOfValues) {
            toDisplayMeasurementGenderAnalysis.results = toDisplayMeasurementGenderAnalysis.results.filter(r => r.measurementValueType === 'text');
            selectedMeasurementType = 'No Unit (Text)';
        }
        this.setState({
            selectedUnit: unit,
            mixtureOfValues: mixtureOfValues,
            selectedMeasurementType: selectedMeasurementType,
            toDisplayMeasurementGenderAnalysis: toDisplayMeasurementGenderAnalysis,
            toDisplayMeasurementGenderCountAnalysis: toDisplayMeasurementGenderCountAnalysis
        });
    }

    fetchChartTitle(gender: any) {
        const {toDisplayMeasurementGenderCountAnalysis} = this.state;
        if (toDisplayMeasurementGenderCountAnalysis) {
            const genderResults = toDisplayMeasurementGenderCountAnalysis.results
                .filter(r => r.stratum3 === gender.stratum2)[0];
            if (genderResults && genderResults.countValue > 20) {
                return gender.analysisStratumName + ' - ' + genderResults.countValue;
            } else {
                return gender.analysisStratumName + ' - &le; ' + 20;
            }
        } else {
            return gender.analysisStratumName + ' - ' + gender.countValue;
        }
    }

    showSpecificMeasurementTypeValues(su: any) {
        const {toDisplayMeasurementGenderAnalysis, conceptAnalyses} = this.state;
        let tempDisplayMeasurementGenderAnalysis = {...conceptAnalyses.measurementValueGenderAnalysis.find(
                        aa => aa.unitName === 'No unit')};
        if (su.toLowerCase().indexOf('text') >= 0) {
            tempDisplayMeasurementGenderAnalysis.results.filter(r => r.measurementValueType === 'text');
        } else {
            tempDisplayMeasurementGenderAnalysis.results.filter(r => r.measurementValueType === 'numeric');
        }
        const tempMeasurementCountAnalysis = conceptAnalyses.measurementGenderCountAnalysis.find(aa => aa.unitName === 'No unit');
        this.setState({
            selectedMeasurementType: su,
            toDisplayMeasurementGenderAnalysis: tempDisplayMeasurementGenderAnalysis,
            toDisplayMeasurementGenderCountAnalysis: tempMeasurementCountAnalysis
        });
    }

    render() {
        const {searchTerm, concept, domain} = this.props;
        const {graphButtons, graphToShow, displayGraphErrorMessage, selectedChartAnalysis, countAnalysis, sourceConcepts,
         isAnalysisLoaded, unitNames, selectedUnit, mixtureOfValues, noUnitValueButtons, selectedMeasurementType,
         genderResults, toDisplayMeasurementGenderAnalysis, loading} = this.state;
        const tabIndex = 0;
        // TODO Add in sources tree in here
        return <React.Fragment>
            <style>{cssStyles}</style>
            <div className='graph-menu'>
            {(selectedChartAnalysis || sourceConcepts) && graphButtons.map((g, index) => {
                return (
                    <div onClick={() => this.selectGraphType(g)}
                    className={graphToShow === g ? 'active chart-choice' : 'chart-choice'}
                    tabIndex={tabIndex} key={index}>
                    <span>{g}</span>
                    <TooltipReactComponent tooltipKey={g}
                    label='EHR Tooltip Hover' searchTerm={searchTerm}
                    action={'Concept graph ' + g + ' tooltip hover on concept ' + concept.conceptName}>
                    </TooltipReactComponent>
                    </div>
                );
          })
        }
            </div>
            {loading ? <Spinner /> : null}
            {displayGraphErrorMessage
                    ? <div className='graph-error-message'>
                        <ErrorMessageReactComponent dataType='chart' />
                      </div>
                    : [
                    <React.Fragment key={concept.conceptId}>
                    {(isAnalysisLoaded && selectedChartAnalysis && countAnalysis && countAnalysis.genderCountAnalysis) &&
                    graphToShow === 'Sex Assigned at Birth' ?
                    <div className='chart' key='biosex-chart'>
                        <BioSexChartReactComponent
                              domain='ehr' genderAnalysis={selectedChartAnalysis}
                              genderCountAnalysis={countAnalysis.genderCountAnalysis} selectedResult=''/>
                    </div> :
                    graphToShow === 'Age' ?
                    <div className='chart' key='age-chart'>
                        <AgeChartReactComponent domain='ehr' ageAnalysis={selectedChartAnalysis}
                        ageCountAnalysis={countAnalysis.ageCountAnalysis} selectedResult=''/>
                    </div> :
                    graphToShow === 'Values' ?
                    <div className='chart' key='values-chart'>
                    {unitNames.map((unit, index) => {
                        return (
                            <div key={index} className={selectedUnit === unit ? 'active btn btn-link unit-choice' : 'btn btn-link unit-choice'}
                            onClick={() => this.showMeasurementGenderHistogram(unit)}>{unit}</div>
                        );
                    })
                    }
                    <div>
                    {mixtureOfValues ?
                    noUnitValueButtons.map((noUnit, index) => {
                        return <div key={index} className={selectedMeasurementType === noUnit ? 'active btn btn-link measurement-filter-choice' : 'btn btn-link measurement-filter-choice'}
                        onClick={() => this.showSpecificMeasurementTypeValues(noUnit)}>{noUnit}</div>;
                    }) : null
                    }
                    </div>
                    <div className='chart-container'>
                    <div className='ehr-m-chart-layout'>
                    {(genderResults && toDisplayMeasurementGenderAnalysis) ?
                    genderResults.map((gender, index) => {
                        return <div key={index} className='ehr-m-chart-item'>
                        <ValueReactChartComponent conceptId={concept.conceptId} valueAnalysis={toDisplayMeasurementGenderAnalysis}
                        genderId={gender.stratum2} chartTitle={this.fetchChartTitle(gender)}/></div>;
                    }) : null
                    }
                    </div>
                    </div>
                    </div> : null
                    }
                    {graphToShow === 'Sources' && sourceConcepts ?
                    <div className='source-layout'>
                        <div className='sources-chart' key='sources-chart'>
                            <div className='concept-box-info'>
                                <p><strong>{concept.conceptName}</strong></p>
                                <p>{concept.vocabularyId} Code: {concept.conceptCode}</p>
                                 <p>OMOP Concept Id: {concept.conceptId}</p>
                            </div>
                            <SourcesChartReactComponent concepts={sourceConcepts} />
                        </div>
                        {(domain === 'condition' || domain === 'procedure') ?
                        <div className='tree-view'>
                        <p>Sources Tree</p>
                        </div> : null }
                    </div> : null}
                    </React.Fragment>
                    ]
            }
            </React.Fragment>;
    }
}

@Component({
  selector: 'app-concept-chart-react',
  template: `<span #root></span>`
})
export class ConceptChartWrapperComponent extends BaseReactWrapper {
  @Input() concept: any;
  @Input() domain: any;
  @Input() searchTerm: string;

  constructor() {
    super(ConceptChartReactComponent, ['concept', 'domain', 'searchTerm']);
  }
}
