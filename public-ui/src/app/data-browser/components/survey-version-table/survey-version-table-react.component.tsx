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
    surveyConceptId: any;
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
    this.fetchAndProcessSurveys();
}

fetchAndProcessSurveys() {
    api.getSurveyVersionCounts(this.props.surveyConceptId).then(
                result => {
                    let surveyVersions = [];
                    result.analyses.items.map(r =>
                    r.results.map((item, i) => {
                        if (item.analysisId === 3400) {
                           surveyVersions.push({
                            monthName: item.stratum4,
                            year: item.stratum5,
                            monthNum: item.stratum3.split('/')[0],
                            participants: item.countValue,
                            numberOfQuestion: ''
                           });
                        } else if (item.analysisId === 3401) {
                            surveyVersions[i].numberOfQuestion = item.countValue;
                        }
                    }
                    ));
                    surveyVersions.sort((a1, a2) => {
                            let a = new Date(a1.year, a1.monthNum.split('/')[0], 1);
                            let b = new Date(a2.year, a2.monthNum.split('/')[0], 1);
                        return a.valueOf() - b.valueOf();
                        });
                    surveyVersions.forEach((survey) => {
                            survey['pdfLink'] = '/assets/surveys/' + survey.monthName.replace('/', '_') + '_COPE_COVID_English_Explorer.pdf';
                        });
                    this.setState({ surveys: surveyVersions });
                }
            );
}

render() {
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
                !!this.state.surveys && this.state.surveys.map((survey) => {
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
    @Input() public surveyConceptId;
    constructor() {
        super(SurveyVersionTableReactComponent, ['surveyConceptId']);
    }
}
