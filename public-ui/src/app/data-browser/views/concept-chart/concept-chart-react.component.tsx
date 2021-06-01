import {
  Component,
  Input
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { VersionChartReactComponent } from 'app/data-browser/charts/chart-version/chart-version-react.component';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ErrorMessageReactComponent } from 'app/data-browser/views/error-message/error-message-react.component';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { GraphType } from 'app/utils/enum-defs';
import { triggerEvent } from 'app/utils/google_analytics';
import * as React from 'react';

interface State {
  graphButtons: any;
  graphToShow: string;
  selectedChartAnalysis: any;
  countAnalysis: any;
  isAnalysisLoaded: boolean;
  displayGraphErrorMessage: boolean;
  measurementGenderCountAnalysis: any;
  selectedMeasurementType: string;
  conceptAnalyses: any;
  selectedUnit: string;
  sourceConcepts: any;
  toDisplayMeasurementGenderAnalysis: any;
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
          graphToShow: GraphType.BiologicalSex,
          displayGraphErrorMessage: false,
          selectedChartAnalysis: null,
          conceptAnalyses: null,
          countAnalysis: null,
          sourceConcepts: null,
          measurementGenderCountAnalysis: null,
          selectedUnit: null,
          selectedMeasurementType: null,
          toDisplayMeasurementGenderAnalysis: null,
          toDisplayMeasurementGenderCountAnalysis: null,
          isAnalysisLoaded: false
        };
    }

    componentDidMount() {
        const {concept} = this.props;
        dataBrowserApi().getConceptAnalysisResults(
          [concept.conceptId.toString()], concept.domainId
        ).then(results => {
            this.setState({
                conceptAnalyses: results.items[0],
                displayGraphErrorMessage: false,
                selectedChartAnalysis: results.items[0].genderAnalysis,
                isAnalysisLoaded: true
            });
        }).catch(e => {
            console.log(e, 'error');
            this.setState({
                displayGraphErrorMessage: true,
                isAnalysisLoaded: true
            });
        });
        dataBrowserApi().getCountAnalysis(concept.domainId, 'ehr')
        .then(results => {
            this.setState({
                countAnalysis: results
            });
        }).catch(e => {
            console.log(e, 'error');
        });
        dataBrowserApi().getSourceConcepts(concept.conceptId)
        .then(results => {
            let sources = results.items.length > 10 ? results.items.slice(0, 10) : results.items;
            this.setState({
                sourceConcepts: sources,
            });
        }).catch(e => {
            console.log(e, 'error');
        });
    }

    selectGraphType(g) {
        const {concept} = this.props;
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
        const {graphToShow, selectedChartAnalysis, measurementGenderCountAnalysis} = this.state;
        if (graphToShow === 'Values') {
            let unitCounts = [];
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
            unitNames.filter(n => n.toLowerCase() !== 'no unit');
            if (noUnit.length > 0) {
                unitNames.push(noUnit[0]);
            }
            if (unitNames.length > 0) {
                    this.setState({
                        selectedUnit: unitNames[0]
                    }, () => {
                        this.showMeasurementGenderHistogram();
                    });
            }
        }
        return;
    }

    showMeasurementGenderHistogram() {
        const {selectedUnit, selectedChartAnalysis, measurementGenderCountAnalysis} = this.state;
        let mixtureOfValues = false;
        if (selectedUnit.toLowerCase() === 'no unit') {
            const unitResults = selectedChartAnalysis.find(aa => aa.unitName === selectedUnit);
            if (unitResults && unitResults.results && unitResults.results.length > 0) {
                const numericResults = unitResults.results.filter(r => r.measurementValueType === 'numeric');
                const textResults = unitResults.results.filter(r => r.measurementValueType === 'text');
                if (numericResults && numericResults.length > 0 && textResults && textResults.length > 0) {
                    mixtureOfValues = true;
                }
            }
        }
        let toDisplayMeasurementGenderAnalysis = { ...selectedChartAnalysis.find(aa => aa.unitName === selectedUnit) };
        let toDisplayMeasurementGenderCountAnalysis = null;
        if (measurementGenderCountAnalysis) {
            toDisplayMeasurementGenderCountAnalysis = measurementGenderCountAnalysis.find(aa => aa.unitName === selectedUnit);
        }
        let selectedMeasurementType = null;
        if (mixtureOfValues) {
            toDisplayMeasurementGenderAnalysis.results = toDisplayMeasurementGenderAnalysis.results.filter(r => r.measurementValueType === 'text');
            selectedMeasurementType = 'No Unit (Text)';
        }
        this.setState({
            selectedMeasurementType: selectedMeasurementType,
            toDisplayMeasurementGenderAnalysis: toDisplayMeasurementGenderAnalysis,
            toDisplayMeasurementGenderCountAnalysis: toDisplayMeasurementGenderCountAnalysis
        });
    }

    render() {
        const {searchTerm, concept} = this.props;
        const {graphButtons, graphToShow, displayGraphErrorMessage, selectedChartAnalysis, countAnalysis, sourceConcepts, isAnalysisLoaded} = this.state;
        const tabIndex = 0;
        // TODO Add in sources chart and sources tree in here
        return <React.Fragment>
            <div className='graph-menu'>
            {graphButtons.map((g, index) => {
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
                        <p>Values Chart</p>
                    </div> : null
                    }
                    {graphToShow === 'Sources' ?
                    <p>Sources Chart</p> : null}
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