import { Component } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { CdrVersionReactComponent } from 'app/data-browser/cdr-version/cdr-version-info';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { SearchComponent } from 'app/data-browser/search/home-search.component';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { PopUpReactComponent } from 'app/shared/components/pop-up/PopUpReactComponent';
import { reactStyles } from 'app/utils';
import { globalStyles } from 'app/utils/global-styles';
import { NavStore } from 'app/utils/navigation';
import { Spinner } from 'app/utils/spinner';
import { environment } from 'environments/environment';
import _ from 'lodash';
import * as React from 'react';

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
.result-boxes {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-bottom: 48px;
    flex-grow: 1;
}

.result-box {
    /* height:auto; */
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* min-width: calc(((100%/12)*3) - 14px); */
    width: calc(((100% / 12) * 3) - 18px);
    margin-right: 18px;
    margin-bottom: 18px;
    border-radius: 5px;
    background-color: #ffffff;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}


.search-icon-container {
    display: flex;
    flex-wrap: wrap;
    flex-flow: column-reverse;
    padding-left:1em;
    padding-bottom:5em;
    justify-content: 'flex-start';
}

@media (max-width: 1000px) {
    .iconlinks {
        margin-bottom: -13em;
    }
    .result-box {
        height: auto;
        min-width: calc(((100% / 12) * 6) - 18px);
        margin-bottom: 18px;
    }
    .result-box:nth-of-type(2) {
        margin-right: 0;
    }
}

.result-box:last-of-type {
    margin-right: 0;
}

.cope-preview {
    justify-content: flex-start;
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
        fontSize: '16px',
        height: '20%'
    },
    resultBody: {
        color: '#302c71',
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontSize: '14px',
        padding: '18px',
        paddingTop: '0px',
        display: 'flex',
        flexDirection: 'column',
        height: '60%'
    },
    resultBoxLink: {
        padding: '18px',
        paddingTop: '36px'
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
    iconLinks: {
        position: 'relative',
        top: '-1rem',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        width: '100%'
    }
});

interface ResultLinkProps {
    name: string;
    description: string;
    questionCount: number;
    standardConceptCount: number;
    domain: string;
    participantCount: number;
    searchWord: string;
}

export const ResultLinksComponent = (class extends React.Component<ResultLinkProps> {
    constructor(props: ResultLinkProps) {
        super(props);
    }

    resultClick(info) {
        if (info.domainConceptId) {
            switch (info.domainConceptId) {
                // condition
                case 19:
                    let url = this.props.searchWord ? 'ehr/conditions/'  + this.props.searchWord : 'ehr/conditions';
                    NavStore.navigateByUrl(url);
                    break;
                // drugs
                case 13:
                    url = this.props.searchWord ? 'ehr/drug-exposures/' + this.props.searchWord : 'ehr/drug-exposures';
                    NavStore.navigateByUrl(url);
                    break;
                // MEASUREMENT
                case 21:
                    url = this.props.searchWord ? 'ehr/labs-and-measurements/' + this.props.searchWord : 'ehr/labs-and-measurements';
                    NavStore.navigateByUrl(url);
                    break;
                // PROCEDURE
                case 10:
                    url = this.props.searchWord ? 'ehr/procedures/' + this.props.searchWord : 'ehr/procedures';
                    NavStore.navigateByUrl(url);
                    break;

            }
        } else if (info.conceptId) {
            switch (info.conceptId) {
                case 1333342:
                    let url = this.props.searchWord ? 'survey/covid-19-participant-experience/' + this.props.searchWord : 'survey/covid-19-participant-experience';
                    NavStore.navigateByUrl(url);
                    break;
                default:
                    url = 'survey/' + info.name.replace(' ', '-').toLowerCase();
                    NavStore.navigateByUrl(url);
                    break;
            }
        } else {
            if (info.name === 'Physical Measurements') {
                const url = this.props.searchWord ? 'physical-measurements/' + this.props.searchWord : 'physical-measurements';
                NavStore.navigateByUrl(url);
            } else if (info.name === 'Fitbit') {
                const url = this.props.searchWord ? 'fitbit/' + this.props.searchWord : 'fitbit';
                NavStore.navigateByUrl(url);
            }
        }
    }
    render() {
        const { name, description, questionCount, standardConceptCount, domain, participantCount } = this.props;
        return <div
            onClick={() => this.resultClick(this.props)}
            className='result-box'>
            <div style={styles.resultBoxTitle}>{name}
                <TooltipReactComponent
                    label='Homepage Tooltip Hover'
                    action={'Hover on ' + name + 'tile tooltip'}
                    tooltipKey={domain ? domain.toLowerCase() : name.toLowerCase()}
                    searchTerm='' /></div>
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
                    <span><strong> {participantCount.toLocaleString()}</strong> participants in this domain</span>
                </span>
            </div>
            <div style={styles.resultBoxLink}>
                {(questionCount ? <a className='result-bottom-link'>View Complete Survey</a> :
                    <a className='result-bottom-link'>View {name}</a>)}
            </div>
        </div>;
    }
});

interface State {
    surveyInfo: any[];
    domainInfo: any[];
    physicalMeasurementsInfo: any[];
    searchWord: string;
    popUp: boolean;
    loading: boolean;
}

export const dBHomeComponent = (
    class extends React.Component<{}, State> {
        constructor(props: State) {
            super(props);
            this.state = {
                surveyInfo: [],
                domainInfo: [],
                physicalMeasurementsInfo: [],
                searchWord: localStorage.getItem('searchText') ? localStorage.getItem('searchText') : '',
                popUp: false,
                loading: true
            };
        }

        search = _.debounce((val) => this.getDomainInfos(), 1000);

        handleChange(val) {
            this.setState({ searchWord: val });
            this.search(val);
        }
        iconClickEvent(iconString: string) {
            if (iconString === 'introductory-videos') { NavStore.navigateByUrl('/' + iconString); }
        }

        // life cycle hook
        componentDidMount() {
            this.getDomainInfos();
        }

        getDomainInfos() {
            // http get the domain info to populate the cards on the homepage
            return dataBrowserApi().getDomainTotals(this.state.searchWord, 1, 1).then(
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
                        physicalMeasurementsInfo: physicalMeasurementsInfo,
                        loading: false
                    });
                }
            ).catch(e => {
                                    console.log(e, 'error');
                                    this.setState({loading: false});
                       });
        }
        closePopUp() {
            this.setState({
                popUp: !this.state.popUp
            });
        }

        render() {
            const { domainInfo, physicalMeasurementsInfo, surveyInfo, searchWord, popUp, loading } = this.state;
            return <React.Fragment>
                <style>{css}</style>
                <h1 style={{ ...globalStyles.primaryDisplay, ...styles.dBTitle }}>Data Browser</h1>
                <p style={{ ...styles.dBDesc, ...globalStyles.bodyLead }}>
                    The Data Browser provides interactive views of the publicly available<i>All of Us </i>
                    Research Program participant data. Currently, participant provided information, including surveys and physical
                    measurements taken at the time of participant enrollment, as well as electronic health record data (EHR) are available.
                EHR data are reported by health care providers and are not participant reported. The <i>All of Us </i>
                    Research Program data will include more data types over time.<br /><br />
                    In order to protect participant privacy, the data are de-identified, limited to aggregate counts rounded up to counts of
                20, and summary demographic information. For more information, please visit our FAQ page.<br /><br />
                    Please read the public data use statement available below for additional information about our unique dataset and how to
                acknowledge the <i>All of Us</i> Research Program in any presentations or publications.<br /><br />

                    <button onClick={() => this.closePopUp()} className='disclaimer-btn'>public data use statement</button>
                </p>
                <div className='search-icon-container'>
                    <div>
                        <SearchComponent value={searchWord} searchTitle='Search Across Data Types'
                            onChange={(val) => this.handleChange(val)}
                            onClear={() => this.handleChange('')} />
                        <CdrVersionReactComponent />
                    </div>
                    <div style={styles.iconLinks}>
                        <div className='icons' onClick={() => this.iconClickEvent('FAQ')}>
                            <a href={environment.researchAllOfUsUrl + '/frequently-asked-questions/#data-browser-faqs'}>
                                <img alt='FAQs'
                                    src='/assets/icons/icons_faqs.png' />
                                <span className='icon-link'>FAQs</span>
                            </a>
                        </div>
                        <div className='icons' onClick={() => this.iconClickEvent('introductory-videos')}>
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
                {(loading) && <Spinner />}
                {!loading &&
                <section style={styles.results}>
                    <h5 style={{ ...globalStyles.secondaryDisplay, ...styles.resultHeading }}>
                        EHR Domains:<TooltipReactComponent
                            label='Homepage Tooltip Hover'
                            searchTerm={searchWord}
                            action='Tooltip Home Page EHR Domains'
                            tooltipKey='ehrDomainHelpText' /></h5>

                    <div className='result-boxes'>
                        {
                            domainInfo.map((domain, index) => {
                                const key = 'domain' + index;
                                return <ResultLinksComponent key={key} searchWord={searchWord} {...domain} />;

                            })

                        }
                    </div>
                    <h5 style={{ ...globalStyles.secondaryDisplay, ...styles.resultHeading }}>Survey Questions:</h5>
                    <div style={styles.resultBoxes}>
                        {
                            surveyInfo.map((survey, index) => {
                                const key = 'survey' + index;
                                return <ResultLinksComponent key={key} searchWord={searchWord} {...survey} />;
                            })

                        }
                    </div>
                    <h5 style={{ ...globalStyles.secondaryDisplay, ...styles.resultHeading }}>
                        Physical Measurements and Wearables:</h5>
                    <div style={styles.resultBoxes}>
                        {
                            physicalMeasurementsInfo.map((phyMeasurements, index) => {
                                const key = 'phyMeasurements' + index;
                                return <ResultLinksComponent key={key} searchWord={searchWord} {...phyMeasurements} />;
                            })
                        }
                    </div>
                </section>
                }
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
