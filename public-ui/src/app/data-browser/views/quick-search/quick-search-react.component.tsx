import {
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    DataBrowserApi, Configuration, CdrVersion, DomainInfosAndSurveyModulesResponse
} from 'publicGenerated/fetch';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseReactWrapper } from '../../base-react/base-react.wrapper';
import { environment } from 'environments/environment';
import { FunctionComponent } from 'react';
import { TooltipService } from 'app/utils/tooltip.service';
const containerElementName = 'myReactComponentContainer';

const ResultLinksComponent: FunctionComponent<any> =
    ({
        name,
        description,
        questionCount,
        standardConceptCount,
        participantCount
    }): any => {
        return  <div className="result-box">
                    <p className="result-box-title">{name}</p>
                    <div className="result-body">
                        <span className="result-body-item">
                            <div className="result-stat">
                                {standardConceptCount}{questionCount}
                            </div>
                            <span>matching medical concepts</span>
                            <span>medical concepts</span>
                        </span>
                        {
                        (questionCount && 
                        <div className="result-body-item">
                            <span>{description}</span>
                        </div>)
                        }
                        <span className="result-body-item result-body-stat" >
                            <span><strong> {participantCount}</strong> participants in this domain</span>
                        </span>
                    </div>
                    <div className="result-box-link">
                        {( questionCount ? <a className="result-bottom-link">View Complete Survey</a> :
                    <a className="result-bottom-link">View {name}</a> )}
                    </div>
                </div>
                
  
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
                }

            }
        )
    }
    public async render() {
        let domainInfo = await this.getDomainInfo();
        const physicalMeasurementDomainInfo = domainInfo.domainInfo.filter(domain => domain.name.toLowerCase() === 'physical measurements' || domain.name.toLowerCase() === 'fitbit');
        
        
        domainInfo.domainInfo =  domainInfo.domainInfo.filter(
            domain => domain.name.toLowerCase() !== 'physical measurements' &&
            domain.name.toLowerCase() !== 'fitbit');
        return ReactDOM.render(
            <React.Fragment>

                {/* <h1 id='db-title' className="primary-display ">Data Browser</h1>
                <p id="db-desc" className="body-default">
                    The Data Browser provides interactive views of the publicly available <i>All of Us</i>
                    Research Program participant data.
                    Currently, participant provided information, including surveys and physical measurements taken at the time of
                    participant enrollment, as well as electronic health record data (EHR) are available. EHR data are reported by health
                    care providers and are not participant reported.
                    The <i>All of Us</i> Research Program data will include more data types over time.
                    <br /><br />
                    In order to protect participant privacy, the data are de-identified, limited to aggregate counts rounded up to counts
                    of 20, and summary demographic information.
                    For more information, please visit our <a href="NEED-A-LINK">FAQ
                    page.</a><br /><br />
                    Please read the public data use statement available below for additional information about our unique dataset and how
                    to acknowledge the <i>All of Us</i> Research Program in any presentations or
                    publications.
                    <br /><br /></p>
                <button className="disclaimer-btn">public data use statement</button> */}



                <section className="results">
                    <h5 className="result-heading secondary-display"> EHR Domains:</h5>
                    <div id="survey" className="result-boxes">
                        {
                            domainInfo.domainInfo.map((domain, index) => {
                                const key = 'domain' + index;
                                return <ResultLinksComponent key={key} {...domain} />

                            })

                        }
                    </div>
                    <h5 className="result-heading secondary-display">Survey Questions:</h5>
                    <div className="result-boxes">
                        {
                            domainInfo.surveyInfo.map((survey, index) => {
                                const key = 'survey' + index;
                                return <ResultLinksComponent key={key} {...survey} />
                            })

                        }
                    </div>
                    <h5 className="result-heading secondary-display">Physical Measurements and Wearables:</h5>
                    <div className="result-boxes">
                        {
                           physicalMeasurementDomainInfo.map((phyMeasurements, index) => {
                                const key = 'phyMeasurements' + index;
                                return <ResultLinksComponent key={key} {...phyMeasurements} />
                            })

                        }
                    </div>
                </section>

            </React.Fragment >, this.containerRef.nativeElement)

    }
}



