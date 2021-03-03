import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { ClrIcon } from '../../../utils/clr-icon';
import { BaseReactWrapper } from '../../../data-browser/base-react/base-react.wrapper';

const containerElementName = 'root';

interface Props {
    surveys: any;
}

export class SurveyVersionTableReactComponent extends React.Component<Props, {}> {
constructor(props: Props) {
    super(props);
    this.processSurveys();
}

processSurveys() {
    this.props.surveys.sort((a1, a2) => {
        if (a1.monthNum.split('/')[0] < a2.monthNum.split('/')[0]) {
            return -1;
        }
        if (a1.monthNum.split('/')[0] > a2.monthNum.split('/')[0]) {
            return 1;
        }
        return 0;
    });
this.props.surveys.forEach((survey, i) => {
    let pdfName = '/assets/surveys/' + survey.monthName.replace('/', '_') + '_COPE_COVID_English_Explorer.pdf';
    survey['pdfLink'] = pdfName;
});
}

render() {
    return <div className="version-box-container">
            <h5><strong>Survey versions</strong></h5>
                <br />
            <div className="version-box">
                <div className="version-box-header">
                <div className="version-box-item">Month</div>
                <div className="version-box-item">Participants</div>
                <div className="version-box-item">Number of Questions</div>
                <div className="version-box-item">Download PDF</div>
            </div>
            <div className="version-box-body">
            {
                this.props.surveys.map((survey, index) => {
                    return (
                        <div className="version-box-row" key={survey.monthName}>
                            <span className="version-box-item">{survey.monthName}</span>
                            <span className="version-box-item">{survey.participants}</span>
                            <span className="version-box-item">{survey.numberOfQuestion}</span>
                            <span className="version-box-item"><a href={survey.pdfLink} download>
                            <ClrIcon shape="file" className="is-solid"  style={{width: 18, height: 18}} /> Survey as PDF</a>
                            </span>
                        </div>
                    );
                })
            }
            </div>
            </div>
           </div>;
    }
}

@Component({
selector: 'survey-version-table-react',
template: `<span #${containerElementName}></span>`,
styleUrls: ['./survey-version-table.component.css', '../../../styles/template.css'],
encapsulation: ViewEncapsulation.None,
})
export class SurveyVersionWrapperComponent extends BaseReactWrapper {
    @Input() public surveys;
    constructor() {
        super(SurveyVersionTableReactComponent, ['surveys']);
    }
}
