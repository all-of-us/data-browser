import {
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TooltipService } from 'app/utils/tooltip.service';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { FunctionComponent } from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';
const containerElementName = 'myReactComponentContainer';

const ResultLinksComponent: FunctionComponent<any> =
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

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-db-home',
    template: `<span #${containerElementName}></span>`,
    styleUrls: ['../../../styles/template.css', './quick-search.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class DbHomeWrapperComponent extends BaseReactWrapper {
    @ViewChild(containerElementName, { static: false }) containerRef: ElementRef;
    api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));
    // oldCom = new QuickSearchComponent();
    domainInfo: any;
    constructor(public tooltipService: TooltipService, public injector: Injector) {
        super(injector);
    }

    public async getDomainInfo() {
        return await this.api.getDomainTotals('', 1, 1).then(
            result => {
                return {
                    surveyInfo: result.surveyModules,
                    domainInfo: result.domainInfos
                };

            }
        );
    }
    public async render() {
        const domainInfo = await this.getDomainInfo();
        const physicalMeasurementDomainInfo = domainInfo.domainInfo.filter(domain => {
            return domain.name.toLowerCase() === 'physical measurements'
                || domain.name.toLowerCase() === 'fitbit';
        });


        domainInfo.domainInfo = domainInfo.domainInfo.filter(
            domain => domain.name.toLowerCase() !== 'physical measurements' &&
                domain.name.toLowerCase() !== 'fitbit');
        return ReactDOM.render(
            <React.Fragment>
                <section className='results'>
                    <h5 className='result-heading secondary-display'> EHR Domains:</h5>
                    <div id='survey' className='result-boxes'>
                        {
                            domainInfo.domainInfo.map((domain, index) => {
                                const key = 'domain' + index;
                                return <ResultLinksComponent key={key} {...domain} />;

                            })

                        }
                    </div>
                    <h5 className='result-heading secondary-display'>Survey Questions:</h5>
                    <div className='result-boxes'>
                        {
                            domainInfo.surveyInfo.map((survey, index) => {
                                const key = 'survey' + index;
                                return <ResultLinksComponent key={key} {...survey} />;
                            })

                        }
                    </div>
                    <h5 className='result-heading secondary-display'>
                        Physical Measurements and Wearables:</h5>
                    <div className='result-boxes'>
                        {
                            physicalMeasurementDomainInfo.map((phyMeasurements, index) => {
                                const key = 'phyMeasurements' + index;
                                return <ResultLinksComponent key={key} {...phyMeasurements} />;
                            })

                        }
                    </div>
                </section>

            </React.Fragment >, this.containerRef.nativeElement);

    }
}



