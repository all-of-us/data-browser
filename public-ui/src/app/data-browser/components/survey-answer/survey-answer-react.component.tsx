import { Component, ViewEncapsulation, Input } from '@angular/core';
import * as React from 'react';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';

import { TooltipReactComponent } from '../tooltip/tooltip-react.component';
import { FunctionComponent } from 'react';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import { ClrIcon } from 'app/utils/clr-icon';
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
    }
    `
interface SurveyRowProps {
    //survey_concept_id
    stratum1
    // question_concept_id
    stratum2
    // answer_concept_id
    stratum3,
    // answer_value_string
    stratum4,
    // question_order
    stratum5,
    // question_path
    stratum6,
    // hasSubQuestions
    stratum7,
    countValue,
    drawerOpen: boolean,
    countPercent
}
interface SurveyRowState {
    drawerOpen,
    subAnswers
}


export const SurveyAnswerRowComponent = (class extends React.Component<SurveyRowProps, SurveyRowState>{
    constructor(props: SurveyRowProps, state: SurveyRowState) {
        super(props);
        this.state = {
            drawerOpen: false,
            subAnswers: []
        }
    }
    surveyConceptId = this.props.stratum1;
    hasSubQuestions = this.props.stratum7;


    openDrawer(e) {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        })
        this.getSubQuestions(1);
    }
    getSubQuestions(level: number) {
        return api.getSubQuestions(this.surveyConceptId, this.props.stratum2, this.props.stratum3, 1)
            .then(
                results => {
                    // this.props.SubQuestion.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
                    // console.log(results.questions.items[0].countAnalysis.results);
                    this.setState({ subAnswers: results.questions.items[0]});
                    console.log(results,'subAnswers');
                    
                })
    }

    render() {
        return   <React.Fragment> <div className="survey-tbl-exp-r survey-tbl-r" onClick={this.hasSubQuestions ? this.openDrawer.bind(this) : undefined}>
            <div className="survey-tbl-d first display-body info-text survey-answer-level-1">
                {this.props.stratum4}
            </div>
            <div className="survey-tbl-r-group">
                <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                    {this.props.stratum3}
                </div>
                <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                    {this.props.countValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
                <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                    {this.props.countPercent.toFixed(2)}%
                    </div>
                <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                    {this.hasSubQuestions === "1" ? <ClrIcon shape="caret" className="survey-row-icon" style={{ color: '#216fb4' }} dir={this.state.drawerOpen ? 'down' : 'right'} /> : <ClrIcon className="survey-row-icon" shape="bar-chart" />}
                </div>
            </div>
        </div >
         {this.state.drawerOpen && this.hasSubQuestions === "1" ? <div className="survey-row-expansion">
             
             <h6 className="sub-question-text"><ClrIcon shape="child-arrow"  />{this.state.subAnswers.conceptName}</h6>
         </div> : undefined}</React.Fragment>
    }
})


interface Props {
    isCopeSurvey: boolean,
    question: any,
}

export const SurveyAnswerReactComponent = (class extends React.Component<Props, {}> {
    constructor(props: Props, ) {
        super(props);
    }

    getQuestionResults() {
        return api.getSurveyQuestionResults(this.props.question.surveyConceptId, this.props.question.conceptId, this.props.question.path)
            .then(
                results => {
                    this.props.question.countAnalysis = results.items.filter(a => a.analysisId === 3110)[0];
                    this.props.question.genderAnalysis = results.items.filter(a => a.analysisId === 3111)[0];
                    this.props.question.ageAnalysis = results.items.filter(a => a.analysisId === 3112)[0];
                    this.props.question.versionAnalysis = results.items.filter(a => a.analysisId === 3113)[0];
                    this.props.question.resultFetchComplete = true;
                })
            .catch(err => {
                console.log('Error searching: ', err);
            })
    };

    render(): any {
        this.getQuestionResults();
        console.log(this.props);

        return <React.Fragment><style>{styleCss}</style>
            <div className="survey-tbl">
                <div className="survey-tbl-r survey-tbl-head">
                    <div className="info-text first survey-tbl-d">
                        Answer
                    </div>
                    <div className="survey-tbl-r-group survey-tbl-r-group-style ">
                        <div className="info-text survey-tbl-d display-body">
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <span><React.Fragment>Concept Code</React.Fragment>
                                <TooltipReactComponent tooltipKey='conceptCodeHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' /></span>
                            }
                        </div >
                        <div className="info-text survey-tbl-d display-body">
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <span><React.Fragment>Participant Count</React.Fragment>
                                <TooltipReactComponent tooltipKey='surveyParticipantCountHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' /></span>
                            }
                        </div >
                        <div className="info-text survey-tbl-d display-body">
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <span><React.Fragment>% Answered</React.Fragment></span>
                            }
                        </div >
                        <div className="info-text survey-tbl-d display-body">
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <React.Fragment></React.Fragment>
                            }
                        </div >
                    </div >
                </div >
                {
                    this.props.question.countAnalysis.results.map((answer, index) => {
                        if (answer.stratum4 !== 'Did not answer') {
                            const key = 'answer' + index;
                            return <SurveyAnswerRowComponent key={key} {...answer} />;
                        }
                    })

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
    @Input() isCopeSurvey
    @Input() question
    constructor() {
        super(SurveyAnswerReactComponent, ['isCopeSurvey', 'question']);
    }


}
