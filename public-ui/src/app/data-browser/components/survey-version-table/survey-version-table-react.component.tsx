import {
    Component,
    Input
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { ClrIcon } from 'app/utils/clr-icon';
import * as React from 'react';

const cssStyles = `
strong {
    font-family: GothamBook, Arial, sans-serif;
}

.version-box-container  {
    width:100%;
    font-size: .8em;
}

.version-box{
    border:1px solid #cccccc;
    border-radius: 3px;
}

.version-box-header,.version-box-row {
    display: grid;
    grid-template-columns: 20% 15% 25% 15% 25%;
    /* justify-content: space-around; */
    width:100%;
}
.version-box-row {
    border-top: 1px solid #cccccc;
}

.version-box-header {
    background: #dae6ed;
}

.version-box-header > .version-box-item {
    font-family: GothamBold;
}
.version-box-body{
    overflow-y: auto;
}
.version-box-item{
    font-weight: bold;
    padding:.5em;
}
`;

const containerElementName = 'root';

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
            <style>{cssStyles}</style>
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
})
export class SurveyVersionWrapperComponent extends BaseReactWrapper {
    @Input() public surveyVersions;
    constructor() {
        super(SurveyVersionTableReactComponent, ['surveyVersions']);
    }
}
