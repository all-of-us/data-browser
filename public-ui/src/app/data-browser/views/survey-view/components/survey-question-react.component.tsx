import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
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
}

interface State {
    showAnswers: boolean;
    questionWithResults: any;
    surveyCountAnalysis: object;
    versionAnalysis: object;
}

export class SurveyQuestionReactComponent extends React.Component<Props, State> {
    versionAnalysis: any[] = [];
    constructor(props: Props) {
        super(props);
        this.state = {
            showAnswers: false,
            questionWithResults: null,
            surveyCountAnalysis: null,
            versionAnalysis: null
        };
    }

    showAnswers(e?) {
        if (e && e.key !== 'Enter') {
            return;
        }
        if (!this.state.questionWithResults) {
            this.getAnalysis();
            this.getCountAnalysis();
            if (this.props.isCopeSurvey) {
                this.getSurveyVersionAnalysis();
            }
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
                    const questionWithResults = {
                        countAnalysis: results.items.filter(a => a.analysisId === 3110)[0],
                        genderAnalysis: results.items.filter(a => a.analysisId === 3111)[0],
                        ageAnalysis: results.items.filter(a => a.analysisId === 3112)[0],
                        participantCountAnalysis: results.items.filter(a => a.analysisId === 3203)[0],
                        // this.processResults(q, this.survey.participantCount);
                    };
                    questionWithResults.countAnalysis.results.sort((a1, a2) => {
                        if (a1.countValue > a2.countValue) {
                            return -1;
                        }
                        if (a1.countValue < a2.countValue) {
                            return 1;
                        }
                        return 0;
                    });


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
                console.log(results, 'results');
                this.setState({ surveyCountAnalysis: results });
                // if (this.surveyCountAnalysis) {
                //     localStorage.setItem('surveyCountAnalysis', JSON.stringify(results));
                // }
            });
    }

    getSurveyVersionAnalysis(): any {
        api.getSurveyVersionCounts(this.props.surveyConceptId)
            .then(
                result => {
                    const versionAnalysis: any[] = [];
                    result.analyses.items.map(r =>
                        r.results.map((item, i) => {
                            if (item.analysisId === 3400) {
                                versionAnalysis.push({
                                    monthName: item.stratum4,
                                    year: item.stratum5,
                                    monthNum: item.stratum3.split('/')[0],
                                    participants: item.countValue,
                                    numberOfQuestion: '',
                                    pdfLink: '/assets/surveys/' + item.stratum4.replace('/', '_') +
                                        '_COPE_COVID_English_Explorer.pdf'
                                });
                            } else if (item.analysisId === 3401) {
                                versionAnalysis[i].numberOfQuestion = item.countValue;
                            }
                        }
                        ));
                    versionAnalysis.sort((a1, a2) => {
                        const a = new Date(a1.year, a1.monthNum.split('/')[0], 1);
                        const b = new Date(a2.year, a2.monthNum.split('/')[0], 1);
                        return a.valueOf() - b.valueOf();
                    });
                    this.setState({
                        versionAnalysis: versionAnalysis
                    });
                }
            );

    }



    render() {
        const { question, searchTerm, isCopeSurvey, participantCount } = this.props;
        const { showAnswers, questionWithResults, surveyCountAnalysis, versionAnalysis } = this.state;
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
                isCopeSurvey={isCopeSurvey}
                question={questionWithResults}
                surveyCountAnalysis={surveyCountAnalysis}
                surveyVersions={isCopeSurvey && versionAnalysis}
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

    constructor() {
        super(SurveyQuestionReactComponent, ['isCopeSurvey', 'question', 'surveyConceptId', 'searchTerm', 'participantCount']);
    }
}
