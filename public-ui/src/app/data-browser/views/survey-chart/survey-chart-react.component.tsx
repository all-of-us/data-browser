import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ErrorMessageReactComponent } from 'app/data-browser/views/error-message/error-message-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { GraphType } from 'app/utils/enum-defs';
import { triggerEvent } from 'app/utils/google_analytics';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface State {
    graphToShow: string;
    selectedChartAnalysis: any;
    displayGraphErrorMessage: boolean;
    isLoaded: boolean;
}

interface Props {
    graphButtons: any;
    question: any;
    answer: any;
    selectedAnalysis: any;
    selectedResult: any;
    surveyName: any;
    searchTerm: any;
    surveyCountAnalysis: any;
    isCopeSurvey: any;
    versionAnalysis: any;
}

export class SurveyChartReactComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {graphToShow: this.props.isCopeSurvey? GraphType.SurveyVersion: GraphType.BiologicalSex, displayGraphErrorMessage: false, isLoaded: false, selectedChartAnalysis: null};
  }

  componentDidMount() {
    this.selectGraphType(this.state.graphToShow, this.props.question, this.props.answer);
  }

  selectGraphType(g: any, q: any, answer: any) {
  console.log('set props');
const {surveyName, searchTerm} = this.props;
const {graphToShow} = this.state;
q.graphToShow = graphToShow;
if (q.graphDataToShow === null) {
  q.graphDataToShow = 'Count';
}
switch (graphToShow) {
  case GraphType.AgeWhenSurveyWasTaken:
    q.selectedAnalysis = q.ageAnalysis;
    break;
  case GraphType.SurveyVersion:
    q.selectedAnalysis = q.versionAnalysis;
    break;
  default:
    q.selectedAnalysis = q.genderAnalysis;
    break;
}
this.setState({graphToShow: g, selectedChartAnalysis: q.selectedAnalysis, isLoaded: true,
displayGraphErrorMessage: q.selectedAnalysis === undefined ||
        (q.selectedAnalysis && q.selectedAnalysis.results.filter(a => a.stratum3 ===
        answer.stratum3).length === 0) }, this.displayTest());
  }

  displayTest() {
    console.log('updated');
    console.log(this.state.selectedChartAnalysis);
  }

  getTooltipKey(g: string) {
      if (g === 'Sex Assigned at Birth') {
        return 'surveyBSChart';
      } else if (g === 'Survey Versions') {
        return 'versionChartHelpText';
      } else if (g === 'Age When Survey Was Taken') {
        return 'surveyAgeChartHelpText';
      } else {
        return g;
      }
  }

  getLabel(g) {
    const {surveyName, question, answer} = this.props;
    return surveyName + ' - Q' +  question.actualQuestionNumber+ ' - ' +  question.conceptName + ' - ' + answer.stratum4 + ' - ' + g;
  }


  render() {
      const {graphButtons, question, answer, searchTerm} = this.props;
      const { isLoaded } = this.state;
      const tabIndex = 0;
      console.log('re-render ?');
      console.log(this.state.graphToShow);
      console.log(this.state.selectedChartAnalysis);
      console.log('re-render ?');
      return <React.Fragment>
        <div className='survey-graph-menu'>
            {
              graphButtons.map((g, index) => {
                return (
                 <div onDoubleClick={() => this.selectGraphType(g, question, answer)}
                 className={this.state.graphToShow === g ? 'active survey-chart-choice' : 'survey-chart-choice'}
                 tabIndex={tabIndex} key={index}>
                 <span>{g}</span>
                 <TooltipReactComponent tooltipKey={this.getTooltipKey(g)}
                 label={this.getLabel(g)} searchTerm={searchTerm} action='Survey Chart Tooltip'></TooltipReactComponent>
                 </div>
                 );
              })
            }
        </div>
{this.state.displayGraphErrorMessage
    ? <div className="graph-error-message">
                  <ErrorMessageReactComponent dataType='chart'></ErrorMessageReactComponent>
                </div>
    : [
        isLoaded && this.state.selectedChartAnalysis.analysisId === 3111 ?
            <div className="chart" key='biosex-chart'>
             <BioSexChartReactComponent
             domain='survey' genderAnalysis={this.state.selectedChartAnalysis}
             genderCountAnalysis={this.props.surveyCountAnalysis.genderCountAnalysis}
             selectedResult={this.props.selectedResult}></BioSexChartReactComponent>
            </div> : [
            isLoaded && this.state.selectedChartAnalysis.analysisId === 3112 ?
            <div className="chart" key='age-chart'>
                                 <AgeChartReactComponent
                                 domain='survey' ageAnalysis={this.state.selectedChartAnalysis}
                                 ageCountAnalysis={this.props.surveyCountAnalysis.ageCountAnalysis}
                                 selectedResult={this.props.selectedResult}></AgeChartReactComponent>
                                </div>: null
            ]
    ]
}

      </React.Fragment>;
  }
}


@Component({
  selector: 'app-survey-chart-react',
  template: `<span #root></span>`,
  styleUrls: ['./survey-chart.component.css', '../../../styles/template.css', '../../../styles/page.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SurveyChartWrapperComponent extends BaseReactWrapper {
  @Input() graphButtons: string[];
  @Input() question: any;
  @Input() answer: any;
  @Input() selectedAnalysis: any;
  @Input() selectedResult: any;
  @Input() surveyName: string;
  @Input() searchTerm: string;
  @Input() surveyCountAnalysis: any;
  @Input() isCopeSurvey: boolean;
  @Input() versionAnalysis: any[];

  constructor() {
    super(SurveyChartReactComponent, ['graphButtons', 'question', 'answer', 'selectedAnalysis', 'selectedResult', 'surveyName', 'searchTerm', 'surveyCountAnalysis', 'isCopeSurvey', 'versionAnalysis']);
  }
}