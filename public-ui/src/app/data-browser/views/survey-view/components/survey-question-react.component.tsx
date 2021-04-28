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
    .see-answers {
        font-size: 14px;
        cursor: pointer;
        color: #216fb4;
    }
    
    .see-answers clr-icon {
        width: 1.3em;
        height: 1.3em;
        color: #216fb4;
    }
`;





interface Props {
    isCopeSurvey: boolean;
    question: object;
    particpantCount: number;
    level: number;
    searchTerm: string;
}

interface State {
    showAnswers: boolean;

}

export class SurveyQuestionReactComponent extends React.Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props);
        this.state = {
            showAnswers: false
        }
    }
    showAnswers(e?) {
        if (e && e.key != 'Enter') {
            return
        }
        this.setState({
            showAnswers: !this.state.showAnswers
        });
    }

    render() {
        const { question, searchTerm } = this.props;
        const { showAnswers } = this.state;
        return <div>
            <style>{styleCss}</style>
            <HighlightReactComponent searchTerm={searchTerm} text={question.conceptName} />
            <div className="see-answers body-lead" tabIndex="0" onClick={() => this.showAnswers()} onKeyPress={(e) => this.showAnswers(e)}>
                See Answers <ClrIcon shape='caret' dir={showAnswers ? 'down' : 'right'} />

            </div>
        </div>
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
    @Input() searchTerm: string;
    constructor() {
        super(SurveyQuestionReactComponent, ['isCopeSurvey', 'question', 'level', 'searchTerm']);
    }


}
