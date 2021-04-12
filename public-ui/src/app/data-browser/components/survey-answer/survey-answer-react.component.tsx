import { Component, Input, ViewEncapsulation } from '@angular/core';

import { ClrIcon } from 'app/utils/clr-icon';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';

import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
export const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));
const containerElementName = 'root';

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
    // survey_concept_id
    stratum1: number;
    // question_concept_id
    stratum2: number;
    // answer_concept_id
    stratum3: number;
    // answer_value_string
    stratum4: string;
    // hasSubQuestions
    stratum7: string;
    countValue: number;
    drawerOpen: boolean;
    countPercent: number;
    isCopeSurvey: boolean;
    partcipantCount: number;
}

interface SurveyRowState {
    drawerOpen: boolean;
    subQuestion: object;
    subAnswers: object;
    subTitle: string;
}


export const SurveyAnswerRowComponent = (class extends React.Component<SurveyRowProps, SurveyRowState> {
    constructor(props: SurveyRowProps, state: SurveyRowState) {
        super(props);

        this.state = {
            drawerOpen: false,
            subQuestion: {},
            subAnswers: {},
            subTitle: ''
        };
    }
    surveyConceptId = this.props.stratum1;
    hasSubQuestions = this.props.stratum7;


    openDrawer(e) {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
        if (this.hasSubQuestions === '1') {
            this.getSubQuestions(1);
        }
    }
    getSubQuestions(level: number) {
        return api.getSubQuestions(this.surveyConceptId, this.props.stratum2, this.props.stratum3, 1)
            .then(
                results => {
                    console.log(results);

                    // this.props.SubQuestion.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
                    // console.log(results.questions.items[0].countAnalysis.results);
                    this.setState({
                        subQuestion: results.questions.items[0],
                        subAnswers: results.questions.items[0].countAnalysis.results,
                        subTitle: results.questions.items[0].conceptName
                    });
                    console.log(this.state.subAnswers, 'subAnswers');
                    // console.log(this.state.subQuestion, 'Sub question');

                });
    }

    render() {
        const parcipantPercentage = this.props.countValue / this.props.partcipantCount;
        return <React.Fragment> <div className='survey-tbl-exp-r survey-tbl-r' onClick={this.openDrawer.bind(this)}>
            <div className='survey-tbl-d first display-body info-text survey-answer-level-1'>
                {this.props.stratum4}
            </div>
            <div className='survey-tbl-r-group'>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.stratum3}
                </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.countValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.countPercent ? this.props.countPercent.toFixed(2) : parcipantPercentage.toFixed(2)}%
                    </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.hasSubQuestions === '1' ?
                        <ClrIcon shape='caret' className='survey-row-icon' style={{ color: '#216fb4' }} dir={this.state.drawerOpen ? 'down'
                            : 'right'} /> : <ClrIcon className='survey-row-icon' shape='bar-chart' />}
                </div>
            </div>
        </div >
            {this.state.drawerOpen ? <div className='survey-row-expansion'>
                {(this.hasSubQuestions === '1' && this.state.subQuestion) ? <React.Fragment>
                    <h6 className='sub-question-text'><ClrIcon shape='child-arrow' />{this.state.subTitle}</h6>
                    <div className='survey-sub-table'>
                        {/* tslint:disable-next-line: no-use-before-declare  */}
                        <SurveyAnswerReactComponent
                            particpantCount={this.props.countValue}
                            question={this.state.subQuestion} isCopeSurvey={this.props.isCopeSurvey} />
                    </div>
                </React.Fragment> :
                    <h5>graph-component</h5>
                }
            </div> : undefined}
        </React.Fragment>;
    }
});

interface Props {
    isCopeSurvey: boolean;
    question: any;
    particpantCount: any;
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

                        if (answer.stratum4 !== 'Did not answer') {
                            const key = 'answer' + index;
                            return <SurveyAnswerRowComponent partcipantCount={this.props.particpantCount}
                                key={key}
                                isCopeSurvey={this.props.isCopeSurvey}{...answer} />;
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
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../../styles/template.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SurveyAnswerWrapperComponent extends BaseReactWrapper {
    @Input() isCopeSurvey;
    @Input() question;
    constructor() {
        super(SurveyAnswerReactComponent, ['isCopeSurvey', 'question']);
    }


}
