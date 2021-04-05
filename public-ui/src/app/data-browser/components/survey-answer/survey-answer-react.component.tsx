import { Component, ViewEncapsulation, Input } from '@angular/core';
import * as React from 'react';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';

import { TooltipReactComponent } from '../tooltip/tooltip-react.component';


const containerElementName = 'root';

export const styleCss =
    `
    @import ../../../page.css
    .survey-tbl {
        width: 100%;
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

interface Props {
    isCopeSurvey: boolean
}



export const SurveyAnswerReactComponent = (class extends React.Component<Props, {}> {
    constructor(props: Props, ) {
        super(props);
    }



    ///////////
    //Header//
    //////////
    render(): any {
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
                
                <div className="survey-tbl-r">
                        <div className="survey-tbl-d first display-body info-text survey-answer-level-1">
SUP
                  

                    </div >
                </div>
            </div>
        </React.Fragment >;
        {/* 
            
            <ng-container * ngIf="!isCopeSurvey" >
                Participant Count
                    < app - tooltip - react[tooltipKey]="'surveyParticipantCountHelpText'"
                    [label] = "getLabel(q,'Multiple Answers for this survey question help text')"
                    [searchTerm] = "searchText.value"[action] = "'Survey Page Tooltip'" ></app - tooltip - react >
                        </ng - container >
                      </div >
    <div className=" info-text survey-tbl-d display-body">
        <ng-container *ngIf="isCopeSurvey">
          Concept Code
                          <app-tooltip-react [tooltipKey]="'conceptCodeHelpText'" [label]="getLabel(q,'Concept Code')"
                                             [searchTerm]="searchText.value" [action]="'Survey Page Tooltip'"></app-tooltip-react>
                        </ng - container >
    <ng-container * ngIf="!isCopeSurvey" >
                          % Answered
                        </ng - container >
                      </div >
    <div className="survey-tbl-d display-body"></div>
                    </div > */



        }


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
    constructor() {
        super(SurveyAnswerReactComponent, ['isCopeSurvey']);
    }


}
