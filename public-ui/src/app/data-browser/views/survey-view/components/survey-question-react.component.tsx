import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent.tsx'
import { ClrIcon } from 'app/utils/clr-icon';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';


const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));
// const dbc = new DbConfigService(api);
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





interface Props {
    isCopeSurvey: boolean;
    question: object;
    particpantCount: number;
    level: number;
    searchTerm:string;
}

interface State {

}

export class SurveyQuestionReactComponent extends React.Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props);
        state = {

        }
    }

    render() {
        const {question,searchTerm} = this.props;
        console.log(searchTerm,'searchterm');
        
      
        return <div><HighlightReactComponent searchTerm={searchTerm} text={question.conceptName}/>{searchTerm}search</div>
    }
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-survey-question-react',
    template: `<span #root></span>`,
    styleUrls: ['../../../../styles/template.css'],
    encapsulation: ViewEncapsulation.None,
})

export class SurveyQuestionWrapperComponent extends BaseReactWrapper {
    @Input() isCopeSurvey: boolean;
    @Input() question: any;
    @Input() level: number;
    constructor() {
        super(SurveyQuestionReactComponent, ['isCopeSurvey', 'question', 'level']);
    }


}
