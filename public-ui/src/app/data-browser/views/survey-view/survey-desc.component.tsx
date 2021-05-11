import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import * as React from 'react';

export const SurveyDescReactComponent =
    (props) => {
    return <div className='page-header'>
               <div className='title-container'>
                 <h1> {props.surveyName} </h1>
                 {
                 props.isCopeSurvey ?
                 <button className='disclaimer-btn' onClick={props.click}>IMPORTANT CONSIDERATIONS FOR
                         COPE SURVEY - LEARN MORE</button>
                         : null
                 }
                 <div className='desc-container'>
                   <p className='body-default help-text survey-desc'>{props.surveyDescription} Survey questions appear in the order in
                     which participants took the survey.</p>
                 </div>
               </div>
               <div className='survey-note'> <span className='bold-note-heading'>Note</span>: The data on this page are:
                 <ul className='survey-note'>
                   <li>Gathered directly from participants through electronic surveys</li>
                   <li>Grouped into bins of 20 to protect privacy</li>
                 </ul>
                 For more information about this survey, please visit the <a target='_blank'
                   href='https://www.researchallofus.org/data-sources/survey-explorer' rel='noopener noreferrer'>Survey
                   Explorer</a>
               </div>
             </div>;
    };

@Component({
    selector: 'app-survey-desc',
    template: `<div #root></div>`,
    styleUrls: ['../../../styles/template.css', '../../../styles/cards.css', './survey-view.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SurveyDescWrapperComponent extends BaseReactWrapper {
    @Input() public surveyName: string;
    @Input() public isCopeSurvey: boolean;
    @Input() public surveyDescription: string;
    @Input('click') click: Function;
    constructor() {
        super(SurveyDescReactComponent, ['surveyName', 'isCopeSurvey', 'surveyDescription', 'click']);
    }
}
