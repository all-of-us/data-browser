import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent'
import { SurveyAnswerReactComponent } from './survey-answer-react.component'
import { ClrIcon } from 'app/utils/clr-icon';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';


const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));
// const dbc = new DbConfigService(api);
const styleCss =
    `
    .see-answers {
        font-size: 14px;
        cursor: pointer;
        color: #216fb4;
    }
    
    .see-answers clr-icon {
        width: 1.3em;
        height: 1.3em;
        color: #216fb4;
    }
`;



interface Props {
    isCopeSurvey: boolean;
    question: any;
    participantCount: number;
    surveyConceptId: number;
    searchTerm: string;
}

interface State {
    showAnswers: boolean;
    fetchComplete: boolean

}

export class SurveyQuestionReactComponent extends React.Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props);
        this.state = {
            showAnswers: false,
            fetchComplete: false
        }
        console.log(props);

    }
    showAnswers(e?) {
        if (e && e.key != 'Enter') {
            return
        }
        this.getAnalyis();
        setTimeout(() => {
            this.setState({
                showAnswers: !this.state.showAnswers
            });
        }, 100);
    }
    componentDidMount() {
        // this.getAnalyis();q
    }

    getAnalyis() {
        api.getSurveyQuestionResults(this.props.surveyConceptId, this.props.question.conceptId, this.props.question.path)
            .then(
                results => {
                    this.props.question.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
                    this.props.question.genderAnalysis = results.items.filter(a => a.analysisId === 3111)[0];
                    this.props.question.ageAnalysis = results.items.filter(a => a.analysisId === 3112)[0];
                    this.props.question.participantCountAnalysis = results.items.filter(a => a.analysisId === 3203)[0];
                    this.props.question.versionAnalysis = results.items.filter(a => a.analysisId === 3113)[0];
                    // this.props.question.resultFetchComplete = true;
                    // this.processResults(q, this.survey.participantCount);
                    this.props.question.countAnalysis.results.sort((a1, a2) => {
                        if (a1.countValue > a2.countValue) {
                            return -1;
                        }
                        if (a1.countValue < a2.countValue) {
                            return 1;
                        }
                        return 0;
                    });
                    this.setState({ fetchComplete: true })
                    console.log(this.props.question.countAnalysis, 'thi');

                }
            )
            .catch(err => {
                console.log('Error searching: ', err);
            });

    }

    render() {
        const { question, searchTerm, isCopeSurvey, participantCount } = this.props;
        const { showAnswers, fetchComplete } = this.state;
        return <div >
            <style>{styleCss}</style>
            <span style={{fontFamily: showAnswers && 'GothamBold', cursor: 'pointer'}} onClick={() => this.showAnswers()} onKeyPress={(e) => this.showAnswers(e)}>
                <HighlightReactComponent searchTerm={searchTerm} text={question.conceptName} />
                {(question.conceptId == 1586140 || question.conceptId == 1585838) && <TooltipReactComponent
                    label='Gender Identity Question Help Text'
                    searchTerm={searchTerm}
                    action='Survey Page Tooltip'
                    tooltipKey='genderIdentityQuestionHelpText' />}
                <div className="see-answers body-lead" tabIndex={0}>
                    See Answers <ClrIcon shape='caret' dir={showAnswers ? 'down' : 'right'} />
                </div>
            </span>
            {(showAnswers && fetchComplete) && <SurveyAnswerReactComponent 
            isCopeSurvey={isCopeSurvey} 
            question={question} 
            level={0} 
            participantCount={participantCount} />}
        </div>
    }
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-survey-question-react',
    template: `<span #root></span>`,
    styleUrls: ['../../../../styles/template.css'],
    encapsulation: ViewEncapsulation.None,
})

export class SurveyQuestionWrapperComponent extends BaseReactWrapper {
    @Input() isCopeSurvey: boolean;
    @Input() question: any;
    @Input() surveyConceptId: number;
    @Input() participantCount: number;
    @Input() searchTerm: string;

    constructor() {
        super(SurveyQuestionReactComponent, ['isCopeSurvey', 'question', 'surveyConceptId', 'searchTerm', 'participantCount']);
    }


}
