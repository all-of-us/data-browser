import {
  Component,
  Input
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { BasicChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-basic-react.component';
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
    measurementGenderCountAnalysis: any;
    conceptAnalyses: any;
    displayGraphErrorMessage: boolean;
    selectedUnit: string;
    selectedMeasurementType: string;
    toDisplayMeasurementGenderAnalysis: any;
    toDisplayMeasurementGenderCountAnalysis: any;
}

interface Props {
    searchTerm: string;
    concept: any;
    domain: string;
}

const chartStyleCss = `
.concept-graph-menu {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 9px;
}
.concept-chart-choice {
  padding: 9px;
  color: #216fb4;
  position: relative;
  display: flex;
  cursor: pointer;
}

.concept-chart-choice .tooltip {
  margin-left: 0.25rem;
}
.concept-chart-choice:hover {
  color: #262262;
}

.concept-chart-choice.active::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 5px;
  right: 0;
  background: #216fb4;
  bottom: 0px;
  border-radius: 5px;
  cursor: pointer;
}
@media (max-width: 600px) {
    .concept-chart-choice {
        font-size: 4vw;
        padding: 2px;
    }
}
`;

export class ConceptChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
        graphToShow: GraphType.BiologicalSex,
        graphButtons: this.props.domain === 'labs & measurements' ? ['Values', 'Sex Assigned at Birth', 'Age', 'Sources'] : ['Sex Assigned at Birth', 'Age', 'Sources'],
        selectedChartAnalysis: null,
        conceptAnalyses: null,
        measurementGenderCountAnalysis: null,
        displayGraphErrorMessage: false,
        selectedUnit: null,
        selectedMeasurementType: null,
        toDisplayMeasurementGenderAnalysis: null,
        toDisplayMeasurementGenderCountAnalysis: null
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
            selectedChartAnalysis: results.items[0].genderAnalysis
        }, () => {
            this.selectGraphType(this.state.graphToShow);
        });
    }).catch(e => {
        console.log(e, 'error');
        this.setState({
            displayGraphErrorMessage: true
        });
    });
  }

  selectGraphType(g: any) {
    const {concept} = this.props;
    const {conceptAnalyses} = this.state;
    let selectedAnalysis;
    let measurementGenderCountAnalysis;
    switch (g) {
        case GraphType.Age:
            selectedAnalysis = conceptAnalyses.ageAnalysis;
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
    const {searchTerm} = this.props;
    const {graphButtons, graphToShow, displayGraphErrorMessage, selectedChartAnalysis} = this.state;
    const label = 'EHR Tooltip Hover';
    const tabIndex = 0;
    return <React.Fragment>
      <style>{chartStyleCss}</style>
      <div className='concept-graph-menu'>
      {
        graphButtons.map((g, index) => {
          return (
            <div onClick={() => this.selectGraphType(g)}
                className={graphToShow === g ? 'active concept-chart-choice' : 'concept-chart-choice'}
                tabIndex={tabIndex} key={index}>
                <span>{g}</span>
                <TooltipReactComponent tooltipKey={g}
                                 label={label} searchTerm={searchTerm} action='Survey Chart Tooltip'>
                                </TooltipReactComponent>
            </div>
          );
        })
      }
      </div>
      {displayGraphErrorMessage
              ? <div className='graph-error-message'>
                <ErrorMessageReactComponent dataType='chart' />
              </div> :
              selectedChartAnalysis && <BasicChartReactComponent />
      }
    </React.Fragment>;
  }
}


@Component({
  selector: 'app-concept-chart-react',
  template: `<span #root></span>`
})
export class ConceptChartWrapperComponent extends BaseReactWrapper {
  @Input() searchTerm: string;
  @Input() concept: string;
  @Input() domain: string;

  constructor() {
    super(ConceptChartReactComponent, ['searchTerm', 'concept', 'domain']);
  }
}
