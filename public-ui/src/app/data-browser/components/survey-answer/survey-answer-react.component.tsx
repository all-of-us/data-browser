import { Component, ViewEncapsulation } from '@angular/core';
import * as React from 'react';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';


const containerElementName = 'root';

export const SurveyAnswerReactComponent = (class extends React.Component {
    constructor(props) {
        super(props);
    }
    render(): any {
        return <React.Fragment>tgus us</React.Fragment>;

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
    constructor() {
        super(SurveyAnswerReactComponent, []);
    }
}
