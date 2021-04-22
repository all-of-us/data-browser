import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ClrIcon } from 'app/utils/clr-icon';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';


const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));
// const dbc = new DbConfigService(api);
const eightColors = [
    '#2F4B7C', '#F99059', '#496D91', '#E75955',
    '#6790A2', '#93003A', '#BFE1C6', '#C5254A'
];

const tenColors = [
    '#2F4B7C', '#FA9B58', '#44668D', '#BC1B48', '#769EA7',
    '#F06F57', '#5B829C', '#93003A', '#BFE1C6', '#DB4451'
];

const fourteenColors = [
    '#2F4B7C', '#FBA858', '#88AFAB', '#CB2D4C', '#3E5E88', '#F78858', '#719AA6', '#B11044', '#4D7294',
    '#EE6857', '#5E869E', '#93003A', '#93003A', '#DF4A53'
];

const eightteenColors = [
    '#2F4B7C', '#FA9659', '#BFE1C6', '#D2364F', '#AB0A42', '#6F98A0', '#3A5A86', '#93B8AC', '#FBAF57',
    '#527997', '#F57D58', '#46698F', '#EC6556', '#C02049', '#60889F', '#80A8AA', '#E14D53', '#93003A',
];

const twentyFiveColors = [
    '#00429D', '#93C4D2', '#6492C0', '#B61A49', '#E37B7E', '#FBAF57', '#73A2C6', '#FA9659', '#4771B2',
    '#DF6772', '#A5D5D8', '#3761AB', '#D0CCB6', '#D95367', '#DAB8A7', '#D3F4E0', '#E38F8B', '#2451A4',
    '#5681B9', '#A60841', '#BFE1C6', '#C42D52', '#82B3CD', '#F57D58', '#93003A'
];

const styleCss =
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
    .survey-row-expanded {
        margin-top: -1em;
        border-left: #cccccc 1px solid;
        border-right: #cccccc 1px solid;
        background: #f6f6f8;
    }
    .active-row {
        background: #f6f6f8;
    }
    .sub-table-1 .sub-question-text, .sub-table-2 .sub-question-text {
        padding-top: 1rem;
    }

    .survey-sub-table {
        padding-left: 2em;
        padding-bottom: 1em;
        width: 98%;
    }
`;


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


const SurveyAnswerRowComponent = (class extends React.Component<SurveyRowProps, SurveyRowState> {
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
        if (this.props.hasSubQuestions === '1') {
            this.nextLevel = this.props.level + 1;
            this.getSubQuestions(this.nextLevel);
        }
    }

    getSubQuestions(level: number) {
        return api.getSubQuestions(this.props.surveyConceptId, this.props.questionConceptId, this.props.answerConceptId, level)
            .then(
                results => {

                    this.setState({
                        subQuestions: this.processResults(results.questions.items, this.props.countValue)
                    });
                })
            .catch((error) => {
                console.log(error);
            });
    }

    processResults(questions: Array<any>, totalCount: number) {
        questions.forEach(q => {
            q.countAnalysis.results = q.countAnalysis.results.filter(a => a.stratum6 === q.path);
            q.genderAnalysis.results = q.genderAnalysis.results.filter(a => a.stratum6 === q.path);
            q.ageAnalysis.results = q.ageAnalysis.results.filter(a => a.stratum6 === q.path);
            if (q.versionAnalysis && q.versionAnalysis.results) {
                q.versionAnalysis.results = q.versionAnalysis.results.filter(a => a.stratum6 === q.path);
            }
            q.countAnalysis.results.sort((a1, a2) => {
                if (a1.countValue > a2.countValue) {
                    return -1;
                }
                if (a1.countValue < a2.countValue) {
                    return 1;
                }
                return 0;
            });
            const answerCount = q.countAnalysis.results.length;
            q.countAnalysis.results.forEach((aCount, i) => {
                if (this.props.isCopeSurvey) {
                    if (answerCount <= 8) {
                        aCount['color'] = eightColors[i];
                    } else if (answerCount > 8 && answerCount <= 10) {
                        aCount['color'] = tenColors[i];
                    } else if (answerCount <= 14) {
                        aCount['color'] = fourteenColors[i];
                    } else if (answerCount <= 18) {
                        aCount['color'] = eightteenColors[i];
                    } else if (answerCount > 18) {
                        aCount['color'] = twentyFiveColors[i];
                    }
                    if (aCount.stratum7 && aCount.stratum7 === '1') {
                        aCount.subQuestionFetchComplete = false;
                    }
                }
                return aCount;
                //   this.addMissingResults(q, aCount, totalCount);
            });
            q.countAnalysis.results.push(this.addDidNotAnswerResult(q.conceptId, q.countAnalysis.results,
                totalCount));
            return q;

        });
        return questions;
    }

    public addDidNotAnswerResult(questionConceptId: any, results: any[], participantCount: number) {
        let didNotAnswerCount = participantCount;
        for (const r of results) {
            didNotAnswerCount = didNotAnswerCount - r.countValue;
        }
        const result = results[0];
        if (didNotAnswerCount <= 0) {
            didNotAnswerCount = 20;
        }
        const notAnswerPercent = this.countPercentage(didNotAnswerCount, participantCount);
        const didNotAnswerResult = {
            analysisId: result.analysisId,
            countValue: didNotAnswerCount,
            countPercent: notAnswerPercent,
            stratum1: result.stratum1,
            stratum2: result.stratum2,
            stratum3: '0',
            stratum4: 'Did not answer',
            stratum5: result.stratum5,
            stratum6: result.stratum6,
        };
        return didNotAnswerResult;
    }

    countPercentage(countValue: number, totalCount: number) {
        if (!countValue || countValue <= 0) { return 0; }
        let percent: number = countValue / totalCount;
        percent = parseFloat(percent.toFixed(4));
        return percent * 100;
    }


    render() {

        const parcipantPercentage = ((this.props.countValue / this.props.participantCount) * 100).toFixed(2);
        return <React.Fragment> <div className={this.state.drawerOpen ? 'active-row survey-tbl-exp-r survey-tbl-r' : 'survey-tbl-exp-r survey-tbl-r'} onClick={this.openDrawer.bind(this)}>
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
                    {this.props.countPercent ? this.props.countPercent.toFixed(2) : parcipantPercentage}%
                    </div>
                <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {this.props.hasSubQuestions === '1' ?
                        <ClrIcon shape='caret' className='survey-row-icon'
                            style={{ color: '#216fb4' }} dir={this.state.drawerOpen ? 'down' : 'right'} /> :
                        <ClrIcon className={this.state.drawerOpen ? 'is-solid survey-row-icon' : 'survey-row-icon'} shape='bar-chart' />}
                </div>
            </div>
        </div >
            {this.state.drawerOpen && <div className='survey-row-expanded'>
                {(this.props.hasSubQuestions === '1' && this.state.subQuestions) ?
                    this.state.subQuestions.map((question, index) => {
                        return <React.Fragment key={index + 'subquestion'}>
                            <h6 className='sub-question-text'><ClrIcon shape='child-arrow' />{question.conceptName}</h6>
                            <div className='survey-sub-table'>
                                {/* tslint:disable-next-line: no-use-before-declare */}
                                <SurveyAnswerReactComponent level={this.nextLevel}
                                    particpantCount={this.props.countValue}
                                    question={question} isCopeSurvey={this.props.isCopeSurvey} />
                            </div>
                        </React.Fragment>;
                    })
                    : <h5>graph-component</h5>
                }
            </div>}
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
                                <span>{this.props.particpantCount ? <React.Fragment>% Answered out of {this.props.particpantCount}
                                </React.Fragment> :
                                    <React.Fragment>% Answered </React.Fragment>}</span>
                            }
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {this.props.isCopeSurvey ? <h1>testIs cope</h1> : <React.Fragment></React.Fragment>}
                        </div >
                    </div >
                </div >

                {
                    this.props.question.countAnalysis &&
                    this.props.question.countAnalysis.results.map((answer, index) => {
                        const answerCleaned = {
                            surveyConceptId: answer.stratum1,
                            questionConceptId: answer.stratum2,
                            answerConceptId: answer.stratum3,
                            answerValueString: answer.stratum4,
                            hasSubQuestions: answer.stratum7,
                            countValue: answer.countValue,
                            countPercent: answer.countPercent
                        };
                        const key = 'answer' + index;
                        return <SurveyAnswerRowComponent level={this.props.level} participantCount={this.props.particpantCount}
                            key={key}
                            isCopeSurvey={this.props.isCopeSurvey}{...answerCleaned} />;
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
