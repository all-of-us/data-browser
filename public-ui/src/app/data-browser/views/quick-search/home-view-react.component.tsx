import {
    Component,
    ElementRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { FunctionComponent } from 'react';

import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';

const containerElementName = 'myReactComponentContainer';
const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

export const ResultLinksComponent: FunctionComponent<any> =
    ({
        name,
        description,
        questionCount,
        standardConceptCount,
        participantCount
    }): any => {
        return <div className='result-box'>
            <p className='result-box-title'>{name}</p>
            <div className='result-body'>
                <span className='result-body-item'>
                    <div className='result-stat'>
                        {standardConceptCount}{questionCount}
                    </div>
                    <span>matching medical concepts</span>
                    <span>medical concepts</span>
                </span>
                {
                    (questionCount &&
                        <div className='result-body-item'>
                            <span>{description}</span>
                        </div>)
                }
                <span className='result-body-item result-body-stat' >
                    <span><strong> {participantCount}</strong> participants in this domain</span>
                </span>
            </div>
            <div className='result-box-link'>
                {(questionCount ? <a className='result-bottom-link'>View Complete Survey</a> :
                    <a className='result-bottom-link'>View {name}</a>)}
            </div>
        </div>;


    };

interface State {
    surveyInfo: Array<any>;
    domainInfo: Array<any>;
    physicalMeasurementsInfo: Array<any>;
    searchWord: string;
}

export const dBHomeComponent = (
    class extends React.Component<{}, State> {
        constructor(props: State) {
            super(props);
            this.state = {
                surveyInfo: [],
                domainInfo: [],
                physicalMeasurementsInfo: [],
                searchWord: ''
            };
        }

        search = _.debounce((val) => this.getDomainInfos(), 1000);

        handleChange(val) {
          this.setState({searchWord: val});
          this.search(val);
        }

        // life cycle hook
        componentWillMount() {
            this.getDomainInfos();
        }

        getDomainInfos() {
            // http get the domain info to populate the cards on the homepage
            return api.getDomainTotals(this.state.searchWord, 1, 1).then(
                result => {
                    result.domainInfos = result.domainInfos.filter(domain =>
                    domain.standardConceptCount > 0);
                    const domainInfo = result.domainInfos.filter(
                        domain => domain.name.toLowerCase() !== 'physical measurements' &&
                            domain.name.toLowerCase() !== 'fitbit');
                    const physicalMeasurementsInfo = result.domainInfos.filter(domain => {
                        return domain.name.toLowerCase() === 'physical measurements'
                            || domain.name.toLowerCase() === 'fitbit';
                    });
                    this.setState({ domainInfo: domainInfo, surveyInfo: result.surveyModules,
                    physicalMeasurementsInfo: physicalMeasurementsInfo });
                }
            );
        }

        render() {
            return <React.Fragment> <div style={{margin: '0 1em'}}>
            <SearchComponent value={this.state.searchWord} onChange={(val) => {
            this.handleChange(val); }}
            onClear={() => { this.handleChange(''); }} />
            </div>
            <section className='results'>
                <h5 className='result-heading secondary-display'> EHR Domains:</h5>
                <TooltipReactComponent
                    label='Homepage Tooltip Hover'
                    searchTerm={this.state.searchWord}
                    action='Tooltip Home Page EHR Domains'
                    tooltipKey='ehrDomainHelpText' />
                <div id='survey' className='result-boxes'>
                    {
                        this.state.domainInfo.map((domain, index) => {
                            const key = 'domain' + index;
                            return <ResultLinksComponent key={key} {...domain} />;

                        })

                    }
                </div>
                <h5 className='result-heading secondary-display'>Survey Questions:</h5>
                <div className='result-boxes'>
                    {
                        this.state.surveyInfo.map((survey, index) => {
                            const key = 'survey' + index;
                            return <ResultLinksComponent key={key} {...survey} />;
                        })

                    }
                </div>
                <h5 className='result-heading secondary-display'>
                    Physical Measurements and Wearables:</h5>
                <div className='result-boxes'>
                    {
                        this.state.physicalMeasurementsInfo.map((phyMeasurements, index) => {
                            const key = 'phyMeasurements' + index;
                            return <ResultLinksComponent key={key} {...phyMeasurements} />;
                        })
                    }
                </div>
            </section></React.Fragment>;
        }
    }
);

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-db-home',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../../styles/template.css', './quick-search.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class DbHomeWrapperComponent extends BaseReactWrapper {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;

    constructor() {
        super(dBHomeComponent, []);
    }
}
