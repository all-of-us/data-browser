import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { addDidNotAnswerResult } from 'app/utils/survey-utils';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { SurveyAnswerReactComponent } from './survey-answer-react.component';


const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

const styles = reactStyles({
    seeAnswers: {
        fontSize: '14px',
        cursor: 'pointer',
        color: '#216fb4',
        border: 'none',
        textDecoration: 'underline',
        outline: 'none'
    },
    clIcon: {
        width: '1.3em',
        height: '1.3em',
        color: '#216fb4'
    }
});


interface Props {
    isCopeSurvey: boolean;
    question: any;
    participantCount: number;
    surveyConceptId: number;
    searchTerm: string;
    versionAnalysis: object;
    surveyName: string;
}

interface State {
    showAnswers: boolean;
    questionWithResults: any;
    surveyCountAnalysis: object;
}

export class SurveyQuestionReactComponent extends React.Component<Props, State> {
    versionAnalysis: any[] = [];
    constructor(props: Props) {
        super(props);
        this.state = {
            showAnswers: false,
            questionWithResults: null,
            surveyCountAnalysis: null
        };
    }

    showAnswers(e?) {
        if (e && e.key !== 'Enter') {
            return;
        }
        if (!this.state.questionWithResults) {
            this.getAnalysis();
            this.getCountAnalysis();
            // if (this.props.isCopeSurvey) {
            //     this.getSurveyVersionAnalysis();
            // }
            this.setState({
                showAnswers: !this.state.showAnswers
            });
        } else {
            this.setState({
                showAnswers: !this.state.showAnswers
            });
        }
    }

    getAnalysis() {
        api.getSurveyQuestionResults(this.props.surveyConceptId, this.props.question.conceptId, this.props.question.path)
            .then(
                results => {
                    const questionWithResults = this.props.question;
                    questionWithResults.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
                    questionWithResults.genderAnalysis = results.items.filter(a => a.analysisId === 3111)[0];
                    questionWithResults.ageAnalysis = results.items.filter(a => a.analysisId === 3112)[0];
                    questionWithResults.versionAnalysis = results.items.filter(a => a.analysisId === 3113)[0];
                    questionWithResults.participantCountAnalysis = results.items.filter(a => a.analysisId === 3203)[0];
                    questionWithResults.countAnalysis.results.sort((a1, a2) => {
                        if (a1.countValue > a2.countValue) {
                            return -1;
                        }
                        if (a1.countValue < a2.countValue) {
                            return 1;
                        }
                        return 0;
                    });
                    let questionCount = 0;
                    for (const result of questionWithResults.countAnalysis.results) {
                        questionCount += result.countValue;
                    }
                    questionWithResults.countAnalysis.results.push(addDidNotAnswerResult(questionWithResults.conceptId,
                    questionWithResults.countAnalysis.results, questionCount));
                    this.setState({ questionWithResults: questionWithResults });
                }
            )
            .catch(err => {
                console.log('Error searching: ', err);
            });
    }
    getCountAnalysis() {
        api.getCountAnalysis(this.props.surveyConceptId.toString(), 'survey').then(
            results => {
                this.setState({ surveyCountAnalysis: results });
                if (this.state.surveyCountAnalysis) {
                    localStorage.setItem('surveyCountAnalysis', JSON.stringify(results));
                }
            });
    }
    render() {
        const { question, searchTerm, isCopeSurvey, participantCount, versionAnalysis, surveyName } = this.props;
        const { showAnswers, questionWithResults, surveyCountAnalysis } = this.state;
        return <div >
            <span style={{ fontFamily: showAnswers && 'GothamBold', cursor: 'pointer' }}
                onClick={() => this.showAnswers()} onKeyPress={(e) => this.showAnswers(e)}>
                <HighlightReactComponent searchTerm={searchTerm} text={question.conceptName} />
                {(question.conceptId === 1586140 || question.conceptId === 1585838) && <TooltipReactComponent
                    label='Gender Identity Question Help Text'
                    searchTerm={searchTerm}
                    action='Survey Page Tooltip'
                    tooltipKey='genderIdentityQuestionHelpText' />}
                <div style={styles.seeAnswers} tabIndex={0}>
                    See Answers
                    <ClrIcon
                        shape='caret'
                        dir={showAnswers ? 'down' : 'right'} />
                </div>
            </span>
            {(showAnswers && questionWithResults) && <SurveyAnswerReactComponent
                surveyName={surveyName}
                searchTerm={searchTerm}
                isCopeSurvey={isCopeSurvey}
                question={questionWithResults}
                surveyCountAnalysis={surveyCountAnalysis}
                surveyVersions={versionAnalysis}
                level={0}
                participantCount={participantCount} />}
        </div>;
    }
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-survey-question-react',
    template: `<span #root></span>`,
})

export class SurveyQuestionWrapperComponent extends BaseReactWrapper {
    @Input() isCopeSurvey: boolean;
    @Input() question: any;
    @Input() surveyConceptId: number;
    @Input() participantCount: number;
    @Input() searchTerm: string;
    @Input() versionAnalysis: object;
    @Input() surveyName: string;

    constructor() {
        super(SurveyQuestionReactComponent, ['isCopeSurvey', 'question', 'surveyConceptId', 'searchTerm', 'participantCount', 'versionAnalysis', 'surveyName']);
    }
}
