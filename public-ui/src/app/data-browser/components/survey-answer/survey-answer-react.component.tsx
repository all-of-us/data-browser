import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { AGE_STRATUM_MAP, GENDER_STRATUM_MAP } from 'app/data-browser/charts/react-base-chart/base-chart.service';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { SurveyChartReactComponent } from 'app/data-browser/views/survey-chart/survey-chart-react.component';
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
    question: any;
    answer: any;
    surveyName: string;
    surveyConceptId: number;
    questionConceptId: number;
    answerConceptId: number;
    answerValueString: string;
    hasSubQuestions: string;
    countValue: number;
    countPercent: number;
    isCopeSurvey: boolean;
    surveyVersions: any;
    surveyCountAnalysis: any;
    searchTerm: string;
    participantCount: number;
    level: number;
}

interface SurveyRowState {
    drawerOpen: boolean;
    subQuestions: Array<any>;
    nextLevel: number;
}


const SurveyAnswerRowComponent = (class extends React.Component<SurveyRowProps, SurveyRowState> {
    constructor(props: SurveyRowProps) {
        super(props);

        this.state = {
            drawerOpen: false,
            subQuestions: [],
            nextLevel: props.hasSubQuestions === '1' ? props.level + 1 : undefined
        };
    }


    openDrawer() {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
        if (this.props.hasSubQuestions === '1' && !this.state.subQuestions.length) {
            this.getSubQuestions();
        }
    }

    getSubQuestions() {
        api.getSubQuestions(this.props.surveyConceptId, this.props.questionConceptId, this.props.answerConceptId, this.state.nextLevel)
            .then(
                results => {

                    this.setState({
                        subQuestions: this.processResults(results.questions.items)
                    });
                });
    }

    processResults(questions: Array<any>) {
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
                this.addMissingResults(q, aCount);
                return aCount;
            });
            q.countAnalysis.results.push(this.addDidNotAnswerResult(q.conceptId, q.countAnalysis.results));
            return q;

        });
        return questions;
    }

  public addMissingResults(q: any, a: any) {
    a.countPercent = this.countPercentage(a.countValue);
    if (q.genderAnalysis) {
      this.addMissingAnalysisResults(q.genderAnalysis,
        q.genderAnalysis.results.
          filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3));
    }
    if (q.ageAnalysis) {
      this.addMissingAnalysisResults(q.ageAnalysis,
        q.ageAnalysis.results.filter(r => r.stratum3 !== null && r.stratum3 === a.stratum3));
    }
  }

  public addMissingAnalysisResults(analysis: any, results: any) {
      const uniqueStratums: string[] = [];
      const fullStratums = analysis.analysisId === 3111 ? ['8507', '8532', '0'] : ['2', '3', '4', '5', '6', '7', '8', '9'];
      for (const result of results) {
        if (uniqueStratums.indexOf(result.stratum5) <= -1) {
          uniqueStratums.push(result.stratum5);
        }
      }
      const missingStratums = fullStratums.
        filter(item => uniqueStratums.indexOf(item) < 0);
      for (const missingStratum of missingStratums) {
        if (results.length > 0) {
          const missingResult = {
            analysisId: analysis.analysisId,
            countValue: 20,
            countPercent: this.countPercentage(20),
            stratum1: results[0].stratum1,
            stratum2: results[0].stratum2,
            stratum3: results[0].stratum3,
            stratum4: results[0].stratum4,
            stratum5: missingStratum,
            stratum6: results[0].stratum6,
            analysisStratumName: analysis.analysisId === 3111 ? GENDER_STRATUM_MAP[missingStratum] : AGE_STRATUM_MAP[missingStratum]
          };
          analysis.results.push(missingResult);
        }
      }
  }

  public addDidNotAnswerResult(questionConceptId: any, results: any[]) {
        let didNotAnswerCount = this.props.countValue;
        for (const r of results) {
            didNotAnswerCount = didNotAnswerCount - r.countValue;
        }
        const result = results[0];
        if (didNotAnswerCount <= 0) {
            didNotAnswerCount = 20;
        }
        const notAnswerPercent = this.countPercentage(didNotAnswerCount);
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

    countPercentage(answerCount: number) {
        if (!answerCount || answerCount <= 0) { return 0; }
        let percent: number = answerCount / this.props.countValue;
        percent = parseFloat(percent.toFixed(4));
        return percent * 100;
    }


    render() {
        const { answerConceptId, answerValueString, hasSubQuestions,
            countValue, countPercent, isCopeSurvey, question, answer, surveyName,
            surveyVersions, surveyCountAnalysis, searchTerm } = this.props;
        const { drawerOpen, subQuestions } = this.state;
        const graphButtons = ['Sex Assigned at Birth', 'Age When Survey Was Taken'];
        if (isCopeSurvey) {
            graphButtons.unshift('Survey Versions');
        }
        const participantPercentage = ((this.props.countValue / this.props.participantCount) * 100).toFixed(2);
        return <React.Fragment>
            <div className={drawerOpen ? 'active-row survey-tbl-exp-r survey-tbl-r' : 'survey-tbl-exp-r survey-tbl-r'}
                onClick={() => this.openDrawer()}>
                <div className='survey-tbl-d first display-body info-text survey-answer-level-1'>
                    {answerValueString}
                </div>
                <div className='survey-tbl-r-group'>
                    <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                        {isCopeSurvey ? <React.Fragment></React.Fragment> : answerConceptId}
                    </div>
                    <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                    {isCopeSurvey ? <React.Fragment></React.Fragment> : countValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </div>
                    <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                        {isCopeSurvey ? answerConceptId : countPercent ? countPercent.toFixed(2) : participantPercentage}
                        {isCopeSurvey ? null : '%'}
                    </div>
                    <div className='survey-tbl-d display-body info-text survey-answer-level-1'>
                        {hasSubQuestions === '1' ?
                            <ClrIcon shape='caret' className='survey-row-icon'
                                style={{ color: '#216fb4' }}
                                dir={drawerOpen ? 'down' : 'right'} /> :
                            <ClrIcon className={drawerOpen ? 'is-solid survey-row-icon' : 'survey-row-icon'} shape='bar-chart' />}
                    </div>
                </div>
            </div >
            {drawerOpen && <div className='survey-row-expanded'>
                {(hasSubQuestions === '1' && subQuestions) ?
                    subQuestions.map((sq, index) => {
                        return <React.Fragment key={index + 'subquestion'}>
                            <h6 className='sub-question-text'><ClrIcon shape='child-arrow' />{sq.conceptName}</h6>
                            <div className='survey-sub-table'>
                                {/* tslint:disable-next-line: no-use-before-declare */}
                                <SurveyAnswerReactComponent level={this.state.nextLevel}
                                    particpantCount={countValue}
                                    question={sq}
                                    isCopeSurvey={isCopeSurvey}
                                    surveyName={surveyName}
                                    surveyVersions={surveyVersions}
                                    surveyCountAnalysis={surveyCountAnalysis}
                                    searchTerm={searchTerm}/>
                            </div>
                        </React.Fragment>;
                    })
                    : <SurveyChartReactComponent graphButtons={graphButtons}
                                                 isCopeSurvey={isCopeSurvey}
                                                 question={question}
                                                 answer={answer}
                                                 selectedResult={answer}
                                                 surveyName={surveyName}
                                                 versionAnalysis={surveyVersions}
                                                 surveyCountAnalysis={surveyCountAnalysis}
                                                 searchTerm={searchTerm}>
                      </SurveyChartReactComponent>
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
    surveyName: string;
    surveyVersions: any;
    surveyCountAnalysis: any;
    searchTerm: any;
}

export class SurveyAnswerReactComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { isCopeSurvey, question, particpantCount, level, surveyName, surveyVersions, surveyCountAnalysis, searchTerm } = this.props;
        return <React.Fragment>
            <style>{styleCss}</style>
            <div className='survey-tbl'>
                <div className='survey-tbl-r survey-tbl-head'>
                    <div className='info-text first survey-tbl-d'>
                        Answer
                    </div>
                    <div className='survey-tbl-r-group survey-tbl-r-group-style '>
                        <div className='info-text survey-tbl-d display-body'>
                        {isCopeSurvey ? null :
                            <span>
                                Concept Code
                                <TooltipReactComponent tooltipKey='conceptCodeHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' />
                            </span>
                        }
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {isCopeSurvey ? null :
                                <span>
                                    Participant Count
                                    <TooltipReactComponent tooltipKey='surveyParticipantCountHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' />
                                </span>
                            }
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {isCopeSurvey ?
                             <span>
                                Concept Code
                                <TooltipReactComponent tooltipKey='conceptCodeHelpText' label='test' searchTerm='test' action='Survey Page Tooltip' />
                             </span>
                             :
                             <span>
                                    {!!particpantCount ? `% Answered out of ${particpantCount}` : '% Answered'}
                             </span>}
                        </div >
                        <div className='info-text survey-tbl-d display-body'>
                            {isCopeSurvey ? null : <React.Fragment></React.Fragment>}
                        </div >
                    </div >
                </div >

                {
                    question.countAnalysis &&
                    question.countAnalysis.results.map((answer, index) => {
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
                        return <SurveyAnswerRowComponent level={level} participantCount={particpantCount}
                            key={key}
                            question={question}
                            answer={answer}
                            surveyName={surveyName}
                            isCopeSurvey={isCopeSurvey}
                            surveyVersions={surveyVersions}
                            surveyCountAnalysis={surveyCountAnalysis}
                            searchTerm={searchTerm}
                            {...answerCleaned}/>;
                    })
                }
            </div>
        </React.Fragment >;
    }
}


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
    @Input() surveyName: string;
    @Input() surveyVersions: any;
    @Input() surveyCountAnalysis: any;
    @Input() searchTerm: any;
    constructor() {
        super(SurveyAnswerReactComponent, ['isCopeSurvey', 'question', 'level', 'surveyName', 'surveyVersions', 'surveyCountAnalysis', 'searchTerm']);
    }


}
