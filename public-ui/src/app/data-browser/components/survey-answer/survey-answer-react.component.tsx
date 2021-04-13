import { Component, Input, ViewEncapsulation } from '@angular/core';

import { ClrIcon } from 'app/utils/clr-icon';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';

import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
export const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

export const styleCss =
    `
    .survey-tbl {
        width: 100%;
    }
    .survey-tbl *{
        font-family: "GothamBook", "Arial", sans-serif,
        font-size: 1em
    }
    .survey-tbl-r.survey-tbl-head {
        /* padding-bottom: 0; */
        background: rgba(218, 230, 237, 0.7);
        border: #cccccc 1px solid;
        border-bottom: none;
    }
    .survey-sub-tbl .survey-tbl-exp-r:last-of-type {
        border-bottom: none;
    }
    .survey-row-icon {
        height: 1.5rem;
        width: 1.5rem;
        color: #2691D0;
      }
    .sub-question-text {
        text-align: left;
        font-weight: bold;
        margin-left: 1em;
        font-family: GothamBold, Arial, Helvetica, sans-serif;
    }
    .survey-row-expansion {
        border-left: #cccccc 1px solid;
        border-right: #cccccc 1px solid;
    }
    .sub-table-1 .sub-question-text, .sub-table-2 .sub-question-text {
        padding-top: 1rem;
    }
    .survey-sub-tbl {
        border-bottom: #cccccc 1px solid;
    }
    .survey-sub-tbl .survey-tbl-exp-r:last-of-type {
        border-bottom: none;
    }

    .survey-sub-table {
        margin-left: 2%;
        width: 98%;
    }

    .survey-sub-table-2 {
        padding-top: 1rem;
        margin-left: 2%;
        width: 98%;
    }`;


interface SurveyRowProps {
    surveyConceptId: number;
    questionConceptId: number;
    answerConceptId: number;
    answerValueString: string;
    hasSubQuestions: string;
    countValue: number;
    countPercent: number;
    isCopeSurvey: boolean;
    participantCount: number;
    level: number;
}

interface SurveyRowState {
    drawerOpen: boolean;
    subQuestions: Array<any>;
    subAnswers: object;
    subTitle: string;
}


export const SurveyAnswerRowComponent = (class extends React.Component<SurveyRowProps, SurveyRowState> {
    constructor(props: SurveyRowProps, state: SurveyRowState) {
        super(props);

        this.state = {
            drawerOpen: false,
            subQuestions: [],
            subAnswers: {},
            subTitle: ''
        };
    }
    nextLevel: number;
    

    openDrawer(e) {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
        if (this.props.hasSubQuestions == '1') {
            this.nextLevel = this.props.level + 1;
            this.getSubQuestions(this.nextLevel);
        }
    }

    getSubQuestions(level: number) {
        return api.getSubQuestions(this.props.surveyConceptId, this.props.questionConceptId, this.props.answerConceptId, level)
            .then(
                results => {
                    this.setState({
                        subQuestions: results.questions.items,
                    });
                })
            .catch((error) => {
                console.log(error);
            });
    }

    render() {

        const parcipantPercentage = this.props.countValue / this.props.participantCount;
        return <React.Fragment> <div className='survey-tbl-exp-r survey-tbl-r' onClick={this.openDrawer.bind(this)}>
            <div className='survey-tbl-d first display-body info-text survey-answer-level-1'>
                {this.props.answerValueString}
            </div>
            <div className='survey-tbl-r-group'>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.answerConceptId}
                </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.countValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.countPercent ? this.props.countPercent.toFixed(2) : parcipantPercentage.toFixed(2)}%
                    </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.hasSubQuestions === '1' ?
                        <ClrIcon shape='caret' className='survey-row-icon' style={{ color: '#216fb4' }} dir={this.state.drawerOpen ? 'down'
                            : 'right'} /> : <ClrIcon className='survey-row-icon' shape='bar-chart' />}
                </div>
            </div>
        </div >
            {this.state.drawerOpen ? <div className='survey-row-expansion'>
                {(this.props.hasSubQuestions === '1' && this.state.subQuestions) ?
                    this.state.subQuestions.map((question, index) => {
                        return <React.Fragment key={index + 'subquestion'}>
                            <h6 className='sub-question-text'><ClrIcon shape='child-arrow' />{question.conceptName}</h6>
                            <div className='survey-sub-table'>
                             {/* tslint:disable-next-line: no-use-before-declare */}
                                <SurveyAnswerReactComponent level={this.nextLevel}
                                    particpantCount={this.props.countValue}
                                    question={question} isCopeSurvey={this.props.isCopeSurvey} />
                            </div>;
                        </React.Fragment>
                    })
                    : <h5>graph-component</h5>
                }
            </div> : undefined}
        </React.Fragment>;
    }
});








interface Props {
    isCopeSurvey: boolean;
    question: any;
    particpantCount: number;
    level: number;
}

export const SurveyAnswerReactComponent = (class extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }
    isSubTable = this.props.particpantCount ? true : false;

    render(): any {
        return <React.Fragment><style>{styleCss}</style>
            <div className='survey-tbl'>
                <div className='survey-tbl-r survey-tbl-head'>
                    <div className='info-text first survey-tbl-d'>
                        Answer
                    </div>
                    <div className='survey-tbl-r-group survey-tbl-r-group-style '>
                        <div className='info-text survey-tbl-d display-body'>
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <span><React.Fragment>Concept Code</React.Fragment>
                                <TooltipReactComponent tooltipKey='conceptCodeHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' /></span>
                            }
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <span><React.Fragment>Participant Count</React.Fragment>
                                <TooltipReactComponent tooltipKey='surveyParticipantCountHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' /></span>
                            }
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> :
                                <span>{this.isSubTable ? <React.Fragment>% Answered out of {this.props.particpantCount}</React.Fragment> :
                                    <React.Fragment>% Answered </React.Fragment>}</span>
                            }
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <React.Fragment></React.Fragment>
                            }
                        </div >
                    </div >
                </div >

                {
                    this.props.question.countAnalysis ?
                        this.props.question.countAnalysis.results.map((answer, index) => {
                            const answerCleaned = {
                                surveyConceptId: answer.stratum1,
                                questionConceptId: answer.stratum2,
                                answerConceptId: answer.stratum3,
                                answerValueString: answer.stratum4,
                                hasSubQuestions: answer.stratum7,
                                countValue: answer.countValue,
                                countPercent: answer.countPercent
                            }
                            if (answer.stratum4 !== 'Did not answer') {
                                const key = 'answer' + index;
                                return <SurveyAnswerRowComponent level={this.props.level} participantCount={this.props.particpantCount}
                                    key={key}
                                    isCopeSurvey={this.props.isCopeSurvey}{...answerCleaned} />;
                            }
                        }) : undefined

                }
            </div>
        </React.Fragment >;
    }
}
);


@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-survey-answer-react',
    template: `<span #root></span>`,
    styleUrls: ['../../../styles/template.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SurveyAnswerWrapperComponent extends BaseReactWrapper {
    @Input() isCopeSurvey: boolean;
    @Input() question: any;
    @Input() level: number;
    constructor() {
        super(SurveyAnswerReactComponent, ['isCopeSurvey', 'question', 'level']);
    }


}
