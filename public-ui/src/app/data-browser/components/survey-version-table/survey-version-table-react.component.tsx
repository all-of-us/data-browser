import {
    Component,
    Input,
    ViewEncapsulation
} from '@angular/core';
import * as React from 'react';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { ClrIcon } from '.app/utils/clr-icon';

const containerElementName = 'root';

interface Props {
    surveys: any;
}

interface State {
    surveys: Array<any>;
}

export class SurveyVersionTableReactComponent extends React.Component<Props, State> {
constructor(props: Props) {
    super(props);
    this.state = {
        surveys: []
    };
}

componentDidMount() {
    this.processSurveys();
}

processSurveys() {
    const sortedSurveys = [...this.props.surveys].sort((a1, a2) => {
    if (a1.monthNum.split('/')[0] < a2.monthNum.split('/')[0]) {
        return -1;
    }
    if (a1.monthNum.split('/')[0] > a2.monthNum.split('/')[0]) {
        return 1;
    }
    return 0;
    });
    sortedSurveys.forEach((survey) => {
        survey['pdfLink'] = '/assets/surveys/' + survey.monthName.replace('/', '_') + '_COPE_COVID_English_Explorer.pdf';
    });
    this.setState({surveys: sortedSurveys});
}

render() {
    return <div className='version-box-container'>
            <h5><strong>Survey versions</strong></h5>
                <br />
            <div className='version-box'>
                <div className='version-box-header'>
                <div className='version-box-item'>Month</div>
                <div className='version-box-item'>Participants</div>
                <div className='version-box-item'>Number of Questions</div>
                <div className='version-box-item'>Download PDF</div>
            </div>
            <div className='version-box-body'>
            {
                !!this.state.surveys && this.state.surveys.map((survey) => {
                    return (
                        <div className='version-box-row' key={survey.monthName}>
                            <span className='version-box-item'>{survey.monthName}</span>
                            <span className='version-box-item'>{survey.participants}</span>
                            <span className='version-box-item'>{survey.numberOfQuestion}</span>
                            <span className='version-box-item'><a href={survey.pdfLink} download>
                            <ClrIcon shape='file' className='is-solid'
                                     style={{width: 18, height: 18}} />
                                    Survey as PDF</a> </span>
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
selector: 'app-survey-version-table-react',
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
