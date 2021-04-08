import {
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AgeChartReactComponent } from 'app/data-browser/charts/chart-age/chart-age-react.component';
import { BioSexChartReactComponent } from 'app/data-browser/charts/chart-biosex/chart-biosex-react.component';
import { VersionChartReactComponent } from 'app/data-browser/charts/chart-version/chart-version-react.component';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ErrorMessageReactComponent } from 'app/data-browser/views/error-message/error-message-react.component';
import { GraphType } from 'app/utils/enum-defs';
import { triggerEvent } from 'app/utils/google_analytics';
import * as React from 'react';

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
    this.state = {
        graphToShow: this.props.isCopeSurvey ? GraphType.SurveyVersion : GraphType.BiologicalSex,
        displayGraphErrorMessage: false,
        isLoaded: false,
        selectedChartAnalysis: null,
    };
  }

  componentDidMount() {
    this.selectGraphType(this.state.graphToShow, this.props.question, this.props.answer);
  }

  selectGraphType(g: any, q: any, answer: any) {
    const {surveyName, searchTerm} = this.props;
    if (answer.stratum4.toLowerCase().indexOf('more than one race') > -1) {
      triggerEvent('conceptClick', 'More than one race /ethncitiy graph view',
        'Expand to see graphs', surveyName + ' - Q'
        + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + answer.stratum4 +
        ' - ' + g, searchTerm, null);
    }
    triggerEvent('conceptClick', 'View Graphs',
      'Expand to see graphs', surveyName + ' - Q'
      + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + answer.stratum4 +
      ' - ' + g, searchTerm, null);
    q.graphToShow = g;
    let selectedAnalysis;
    switch (g) {
        case GraphType.AgeWhenSurveyWasTaken:
             selectedAnalysis = q.ageAnalysis;
             break;
        case GraphType.SurveyVersion:
             selectedAnalysis = q.versionAnalysis;
             break;
        default:
             selectedAnalysis = q.genderAnalysis;
             break;
    }
    this.setState({
        graphToShow: g,
        selectedChartAnalysis: selectedAnalysis,
        isLoaded: true,
        displayGraphErrorMessage: selectedAnalysis === undefined ||
            (selectedAnalysis && selectedAnalysis.results.filter(a => a.stratum3 ===
            answer.stratum3).length === 0) });
    triggerEvent('graphTabClick', 'Survey Graph',
      'Click', surveyName + ' - ' + q.graphToShow + ' - Q'
      + q.actualQuestionNumber + ' - ' + q.conceptName + ' - ' + answer.stratum4 +
      ' - ' + g, searchTerm, null);
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
    return surveyName + ' - Q' +  question.actualQuestionNumber + ' - ' +
    question.conceptName + ' - ' + answer.stratum4 + ' - ' + g;
  }


  render() {
      const {graphButtons, question, answer, searchTerm, surveyCountAnalysis, selectedResult, versionAnalysis} = this.props;
      const { isLoaded, graphToShow, displayGraphErrorMessage, selectedChartAnalysis } = this.state;
      const tabIndex = 0;
      return <React.Fragment>
        <div className='survey-graph-menu'>
            {
              graphButtons.map((g, index) => {
                return (
                 <div onClick={() => this.selectGraphType(g, question, answer)}
                 className={graphToShow === g ? 'active survey-chart-choice' : 'survey-chart-choice'}
                 tabIndex={tabIndex} key={index}>
                 <span>{g}</span>
                 <TooltipReactComponent tooltipKey={this.getTooltipKey(g)}
                 label={this.getLabel(g)} searchTerm={searchTerm} action='Survey Chart Tooltip'>
                 </TooltipReactComponent>
                 </div>
                 );
              })
            }
        </div>
{displayGraphErrorMessage
    ? <div className='graph-error-message'>
                  <ErrorMessageReactComponent dataType='chart'/>
                </div>
    : isLoaded && selectedChartAnalysis.analysisId === 3111 ?
            <div className='chart' key='biosex-chart'>
             <BioSexChartReactComponent
             domain='survey' genderAnalysis={selectedChartAnalysis}
             genderCountAnalysis={surveyCountAnalysis.genderCountAnalysis}
             selectedResult={selectedResult}/>
            </div> :
            isLoaded && selectedChartAnalysis.analysisId === 3112 ?
            <div className='chart' key='age-chart'>
                                 <AgeChartReactComponent
                                 domain='survey' ageAnalysis={selectedChartAnalysis}
                                 ageCountAnalysis={surveyCountAnalysis.ageCountAnalysis}
                                 selectedResult={selectedResult}/>
            </div> :
            isLoaded && selectedChartAnalysis.analysisId === 3113 ?
            <div className='chart' key='age-chart'>
            <VersionChartReactComponent versionAnalysis={selectedChartAnalysis}
            surveyVersionAnalysis={versionAnalysis}
            selectedResult={selectedResult}/>
            </div> : null
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
    super(SurveyChartReactComponent, ['graphButtons', 'question', 'answer', 'selectedAnalysis',
    'selectedResult', 'surveyName', 'searchTerm', 'surveyCountAnalysis',
    'isCopeSurvey', 'versionAnalysis']);
  }
}
