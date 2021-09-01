import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { reactStyles } from 'app/utils';
import * as React from 'react';

const styles = reactStyles({
    pageHeader: {
        padding: '18px'
    },
    titleContainer: {
        width: '100%',
        paddingRight: '18px',
        margin: '0',
        lineHeight: '1em'
    },
    disclaimerBtn: {
        padding: '0.5rem',
        marginTop: '1rem'
    },
    descContainer: {
        flexWrap: 'wrap',
        alignItems: 'center'
    }
});

const cssStyles = `
.page-header {
  padding:18px 0;
}
.disclaimer-btn {
  padding: 1rem 2rem;
  color: #f9f9fa;
  text-transform: uppercase;
  border-radius: 0.3rem;
  background: #816492;
}
.disclaimer-btn:hover {
  background: #262262;
  color: #fff;
}
.body-default,
p {
  font-family: "GothamBook", "Arial", sans-serif;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  font-size: 16px;
  letter-spacing: normal;
  text-align: left;
  color: #262262;
}
.help-text {
  font-size: 16px;
}
.survey-desc {
  padding-top: 1%;
}
.survey-note {
  font-size: 16px;
  align-items: center;
  margin: 5px;
}
.bold-note-heading {
    font-family: GothamBold, Arial, sans-serif;
    font-weight: bold;
}
@media only screen and (max-width: 1169px) {
  .page-header {
    padding:1em;
  }
}
`;

export const SurveyDescReactComponent =
    (props) => {
    return <React.Fragment>
           <style>{cssStyles}</style>
           <div className='page-header'>
               <div className='title-container' style={styles.titleContainer}>
                 <h1> {props.surveyName} </h1>
                 {
                 props.isCopeSurvey ?
                 <button className='disclaimer-btn' style={styles.disclaimerBtn} onClick={props.click}>IMPORTANT CONSIDERATIONS FOR
                         COPE SURVEY - LEARN MORE</button>
                         : null
                 }
                 <div className='desc-container' style={styles.descContainer}>
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
             </div>
             </React.Fragment>;
    };

@Component({
    selector: 'app-survey-desc',
    template: `<div #root></div>`
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
