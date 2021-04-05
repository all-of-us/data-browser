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
    }`


export const SurveyAnswerRowComponent = ({
    // answer_concept_id
    stratum3,
    // answer_value_string
    stratum4,
    // hasSubQuestions
    stratum7,
    countValue,
    countPercent
}) => {

    countPercent = countPercent.toFixed(2);
    return <div className="survey-tbl-exp-r survey-tbl-r">
        <div className="survey-tbl-d first display-body info-text survey-answer-level-1">
            {stratum4}
        </div>
        <div className="survey-tbl-r-group">
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                {stratum3}
            </div>
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                {countValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </div>
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                {countPercent}%
                    </div>
            <div className="survey-tbl-d display-body info-text survey-answer-level-1">
                {stratum7 === "1" ?<ClrIcon shape="caret" dir="down" /> : <span>Graph</span> }


            </div>
        </div>
    </div >
}

interface Props {
    isCopeSurvey: boolean,
    question: any,
    survey: any
}

// interface State {
//     // answer concept id
//     stratum3: string
//     // answer test
//     stratum4: string,
//     countValue: number,


// }



export const SurveyAnswerReactComponent = (class extends React.Component<Props, {}> {
    constructor(props: Props, ) {
        super(props);
        console.log(props.survey, 'before');
    }

    getQuestionResults() {
        return api.getSurveyQuestionResults(this.props.question.surveyConceptId, this.props.question.conceptId, this.props.question.path)
            .then(
                results => {
                    console.log(results);
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
        console.log(this.props.question, 'after');
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
                        console.log(answer.stratum4, 'answer');
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
    @Input() survey
    @Input() question
    constructor() {
        super(SurveyAnswerReactComponent, ['isCopeSurvey', 'survey', 'question']);
    }


}
