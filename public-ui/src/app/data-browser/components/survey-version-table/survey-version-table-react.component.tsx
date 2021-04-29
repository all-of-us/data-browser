import {
    Component,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { ClrIcon } from 'app/utils/clr-icon';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';

const containerElementName = 'root';
const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

interface Props {
    surveyVersions: Array<any>;
}

export class SurveyVersionTableReactComponent extends React.Component<Props, {}> {
constructor(props: Props) {
    super(props);
}

render() {
    const {surveyVersions} = this.props;
    return <div className='version-box-container'>
            <h5><strong>Survey versions</strong></h5>
                <br />
            <div className='version-box'>
                <div className='version-box-header'>
                <div className='version-box-item'>Month</div>
                <div className='version-box-item'>Year</div>
                <div className='version-box-item'>Participants</div>
                <div className='version-box-item'>Number of Questions</div>
                <div className='version-box-item'>Download PDF</div>
            </div>
            <div className='version-box-body'>
            {
                !!surveyVersions && surveyVersions.map((survey) => {
                    return (
                        <div className='version-box-row' key={survey.monthName}>
                            <span className='version-box-item'>{survey.monthName}</span>
                            <span className='version-box-item'>{survey.year}</span>
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
    @Input() public surveyVersions;
    constructor() {
        super(SurveyVersionTableReactComponent, ['surveyVersions']);
    }
}
