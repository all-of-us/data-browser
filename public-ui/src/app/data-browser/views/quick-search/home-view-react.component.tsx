import { Component } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { CdrVersionReactComponent } from 'app/data-browser/cdr-version/cdr-version-info';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { PopUpReactComponent } from 'app/shared/components/pop-up/PopUpReactComponent';
import { reactStyles } from 'app/utils';
import { globalStyles } from 'app/utils/global-styles';
import { environment } from 'environments/environment';
import _ from 'lodash';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import { FunctionComponent } from 'react';

const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));



const css = `
.disclaimer-btn {
    padding: 1rem 2rem;
    color: #f9f9fa;
    text-transform: uppercase;
    border-radius: 0.3rem;
    background: #816492;
}

.disclaimer-btn:hover {
    background: #262262;
    color: #fff;
  }

  .icons img {
    width: 100px;
}

.icons:first-of-type {
    margin-left: 0;
}
.icons {
    width: 100px;
    margin-left: 1.5rem;
    text-align: center;
}
.icons img {
    text-align: center;
}
.result-bottom-link {
    font-size: 15px;
    color: #337ab7;
    cursor: pointer;
}

.result-bottom-link:hover {
    color: #262262;
}
    `;
const styles = reactStyles({
    searchIconLayout: {
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        padding: '1em'
    },
    results: {
        padding: '18px'
    },
    resultBoxes: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginBottom: '48px',
        flexGrow: 1
    },
    resultBox: {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 'calc(((100% / 12) * 3) - 18px)',
        marginRight: '18px',
        marginBottom: '18px',
        borderRadius: '5px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px 0 rgba(0, 0, 0, 0.15)'
    },
    resultBoxTitle: {
        color: '#337ab7',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        padding: '18px',
        paddingBottom: '3px',
        margin: '0',
        fontSize: '16px'
    },
    resultBody: {
        color: '#302c71',
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontSize: '14px',
        padding: '18px',
        paddingTop: '0px',
        display: 'flex',
        flexDirection: 'column'
    },
    resultBoxLink: {
        padding: '18px',
        paddingTop: '0'
    },
    resultHeading: {
        fontSize: '23px',
        margin: '0',
        padding: '9px',
        paddingLeft: '0'
    },
    resultBodyItem: {
        padding: '6px 0'
    },
    resultStat: {
        color: '#302c71',
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '35px',
        lineHeight: '1em'
    },
    dBTitle: {
        textAlign: 'center',
        margin: 0,
        padding: '18px'
    },
    dBDesc: {
        padding: '18px',
        paddingBottom: '63px',
        margin: '0 auto',
        lineHeight: '2',
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontSize: '20px'
    },
    dbSubDesc: {
        padding: '2rem',
        textAlign: 'center'
    },
    iconlinks: {
        position: 'relative',
        top: '2rem',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        width: '100%'
    }


});

export const ResultLinksComponent: FunctionComponent<any> =
    ({
        name,
        description,
        questionCount,
        standardConceptCount,
        participantCount
    }): any => {
        return <div style={styles.resultBox}>
            <p style={styles.resultBoxTitle}>{name}</p>
            <div style={styles.resultBody}>
                <span style={styles.resultBodyItem}>
                    <div style={styles.resultStat}>
                        {standardConceptCount}{questionCount}
                    </div>
                    <span>matching medical concepts</span>
                    <span>medical concepts</span>
                </span>
                {
                    (questionCount &&
                        <div style={styles.resultBodyItem}>
                            <span>{description}</span>
                        </div>)
                }
                <span style={styles.resultBodyItem} >
                    <span><strong> {participantCount}</strong> participants in this domain</span>
                </span>
            </div>
            <div style={styles.resultBoxLink}>
                {(questionCount ? <a className='result-bottom-link'>View Complete Survey</a> :
                    <a className='result-bottom-link'>View {name}</a>)}
            </div>
        </div>;


    };

interface State {
    surveyInfo: any[];
    domainInfo: any[];
    physicalMeasurementsInfo: any[];
    searchWord: string;
    popUp: boolean;
}

export const dBHomeComponent = (
    class extends React.Component<{}, State> {
        constructor(props: State) {
            super(props);
            this.state = {
                surveyInfo: [],
                domainInfo: [],
                physicalMeasurementsInfo: [],
                searchWord: '',
                popUp: false
            };
        }

        search = _.debounce((val) => this.getDomainInfos(), 1000);

        handleChange(val) {
            this.setState({ searchWord: val });
            this.search(val);
        }
        iconClickEvent(iconString: string) {
            // dbc.triggerEvent('HelpEvent', 'Help', 'Click',
            //     iconString, null, null);
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
                    this.setState({
                        domainInfo: domainInfo, surveyInfo: result.surveyModules,
                        physicalMeasurementsInfo: physicalMeasurementsInfo
                    });
                }
            );
        }
        closePopUp() {
            this.setState({
                popUp: !this.state.popUp
            });
        }

        render() {
            const { domainInfo, physicalMeasurementsInfo, surveyInfo, searchWord, popUp } = this.state;
            return <React.Fragment>
                <style>{css}</style>
                <h1 style={{ ...globalStyles.primaryDisplay, ...styles.dBTitle }}>Data Browser</h1>
                <p style={{ ...styles.dBDesc, ...globalStyles.bodyLead }}>
                    The Data Browser provides interactive views of the publicly available<i>All of Us </i>
                    Research Program participant data. Currently, participant provided information, including surveys and physical
                    measurements taken at the time of participant enrollment, as well as electronic health record data (EHR) are available.
                EHR data are reported by health care providers and are not participant reported. The <i>All of Us </i>
                    Research Program data will include more data types over time.<br></br><br></br>
                    In order to protect participant privacy, the data are de-identified, limited to aggregate counts rounded up to counts of
                20, and summary demographic information. For more information, please visit our FAQ page.<br></br><br></br>
                    Please read the public data use statement available below for additional information about our unique dataset and how to
                acknowledge the <i>All of Us</i> Research Program in any presentations or publications.<br></br><br></br>

                    <button onClick={() => this.closePopUp()} className='disclaimer-btn'>public data use statement</button>
                </p>
                <div style={styles.searchIconLayout}>
                    <div>
                        <SearchComponent value={searchWord} 
                                                           onChange={(val) => this.handleChange(val)}
                                                           onClear={() => this.handleChange('')} />
                        <CdrVersionReactComponent />
                    </div>
                    <div style={styles.iconlinks}>
                        <div className='icons' onClick={() => this.iconClickEvent('FAQ')}>
                            <a href={environment.researchAllOfUsUrl + '/frequently-asked-questions/#data-browser-faqs'}>
                                <img alt='FAQs'
                                    src='/assets/icons/icons_faqs.png' />
                                <span className='icon-link'>FAQs</span>
                            </a>
                        </div>
                        <div className='icons' onClick={() => this.iconClickEvent('Intro-Videos')}>
                            <a>
                                <img alt='Introductory Videos'
                                    src='/assets/icons/icons_introductoryvideo.png' />
                                <span className='icon-link'>Introductory Videos</span>
                            </a>
                        </div>
                        <div className='icons' onClick={() => this.iconClickEvent('User-Guide')}>
                            <a href='/assets/pdf/Databrowser_User_Guide_in_RH 5_18_20.pdf' target='_blank' ><img
                                alt='User Guide' src='/assets/icons/icons_userguide.png' /><span
                                    className='icon-link'>User Guide</span>
                                </a>
                        </div>
                    </div>
                </div>

                <section style={styles.results}>
                    <h5 style={{ ...globalStyles.secondaryDisplay, ...styles.resultHeading }}>
                        EHR Domains:<TooltipReactComponent
                            label='Homepage Tooltip Hover'
                            searchTerm={searchWord}
                            action='Tooltip Home Page EHR Domains'
                            tooltipKey='ehrDomainHelpText' /></h5>

                    <div style={styles.resultBoxes}>
                        {
                            domainInfo.map((domain, index) => {
                                const key = 'domain' + index;
                                return <ResultLinksComponent key={key} {...domain} />;

                            })

                        }
                    </div>
                    <h5 style={{ ...globalStyles.secondaryDisplay, ...styles.resultHeading }}>Survey Questions:</h5>
                    <div style={styles.resultBoxes}>
                        {
                            surveyInfo.map((survey, index) => {
                                const key = 'survey' + index;
                                return <ResultLinksComponent key={key} {...survey} />;
                            })

                        }
                    </div>
                    <h5 style={{ ...globalStyles.secondaryDisplay, ...styles.resultHeading }}>
                        Physical Measurements and Wearables:</h5>
                    <div style={styles.resultBoxes}>
                        {
                            physicalMeasurementsInfo.map((phyMeasurements, index) => {
                                const key = 'phyMeasurements' + index;
                                return <ResultLinksComponent key={key} {...phyMeasurements} />;
                            })
                        }
                    </div>
                </section>
                {popUp && <PopUpReactComponent helpText='HomeViewPopup' onClose={() => this.closePopUp()} />}
            </React.Fragment >;
        }
    }
);

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'react-db-home',
    template: `<span #root></span>`
})

export class DbHomeWrapperComponent extends BaseReactWrapper {

    constructor() {
        super(dBHomeComponent, []);
    }
}
