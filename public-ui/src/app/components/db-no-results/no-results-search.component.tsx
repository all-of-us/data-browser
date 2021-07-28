import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { reactStyles } from 'app/utils';
import { domainToRoute, surveyIdToRoute } from 'app/utils/constants';
import { navigateByUrl } from 'app/utils/navigation';
import { LoadingDots } from 'app/utils/spinner';
import * as React from 'react';

const styles = reactStyles({
    loadingText: {
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontStretch: 'normal',
        lineHeight: '1.5',
        fontSize: '16px',
        letterSpacing: 'normal',
        textAlign: 'left',
        color: '#262262',
        paddingLeft: '0'
  },
  noResults: {
        marginTop: '-1rem',
        padding: '1em'
  },
  domainResult: {
        paddingLeft: '0.2em'
  },
  loadingDiv: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: '1em'
  },
  spinnerDiv: {
        marginTop: '1em',
        marginBottom: '0.2em',
        marginLeft: '0.5em'
  }
});

const styleCss =
`
a:link,a:visited,a{
    color:#2aa3d8;
}
`;

interface Props {
    searchValue: string;
    measurementTestFilter: number;
    measurementOrderFilter: number;
    domainMatch: Function;
}

interface State {
    domainInfoResults: Array<any>;
    surveyModuleResults: Array<any>;
    pmResults: Array<any>;
    fitbitResults: Array<any>;
    loading: boolean;
}

export class NoResultSearchComponent extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            domainInfoResults: [],
            surveyModuleResults: [],
            pmResults: [],
            fitbitResults: [],
            loading: true
        };
    }

    componentDidMount() {
        this.fetchDomainTotals();
    }

    fetchDomainTotals() {
        const {searchValue, measurementTestFilter, measurementOrderFilter} = this.props;
        dataBrowserApi().getDomainTotals(searchValue, measurementTestFilter, measurementOrderFilter).then(result => {
            result.domainInfos = result.domainInfos.filter(domain => domain.standardConceptCount > 0);
            this.setState({
                domainInfoResults: result.domainInfos.filter(domain =>
                  domain.name.toLowerCase() !== 'physical measurements' && domain.name.toLowerCase() !== 'fitbit'),
                surveyModuleResults: result.surveyModules.filter(survey => survey.questionCount > 0),
                pmResults: result.domainInfos.filter(domain => domain.name.toLowerCase() === 'physical measurements'),
                fitbitResults: result.domainInfos.filter(domain => domain.name.toLowerCase() === 'fitbit'),
                loading: false
            });
        });
    }

    handleOnClick(domainInfo: any, type: string) {
        const {searchValue, domainMatch} = this.props;
        let url = '';
        if (type === 'ehr') {
            localStorage.setItem('ehrDomain', JSON.stringify(domainInfo));
            url += 'ehr/' + domainToRoute[domainInfo.domain.toLowerCase()];
            url += '/' + searchValue;
            domainMatch();
            navigateByUrl(url);
        } else if (type === 'survey') {
            localStorage.setItem('surveyModule', JSON.stringify(domainInfo));
            url += 'survey/' + surveyIdToRoute[domainInfo.conceptId];
            url += '/' + searchValue;
            domainMatch(surveyIdToRoute[domainInfo.conceptId]);
            navigateByUrl(url);
        } else if (type === 'pm') {
            url += 'physical-measurements/' + '/' + searchValue;
            navigateByUrl(url);
        } else if (type === 'fitbit') {
            url += 'fitbit';
            localStorage.setItem('searchText', searchValue);
            navigateByUrl(url);
        }
    }

    render() {
        const {searchValue} = this.props;
        const {loading, domainInfoResults, surveyModuleResults, pmResults, fitbitResults} = this.state;
        return <React.Fragment>
            <style>{styleCss}</style>
            <div style={styles.noResults}>
                { loading ?
                <div style={styles.loadingDiv}>
                    <p style={styles.loadingText}>Searching whole site for <strong>{searchValue} </strong></p>
                    <div style={styles.spinnerDiv}><LoadingDots /></div>
                </div>
                : null
                }
                {
                     domainInfoResults.map((domainInfo, index) => {
                        const key = domainInfo.name + index;
                        return <div key={key}>
                            {domainInfo.standardConceptCount} results available in the domain:
                            <a style={styles.domainResult} onClick={() => this.handleOnClick(domainInfo, 'ehr')}>{domainInfo.name}</a>
                        </div>;
                     })
                }
                {
                    surveyModuleResults.map((surveyInfo, index) => {
                        const key = surveyInfo.name + index;
                        return <div key={key}>
                            {surveyInfo.questionCount} related questions in survey:
                            <a style={styles.domainResult} onClick={() => this.handleOnClick(surveyInfo, 'survey')}>{surveyInfo.name}</a>
                        </div>;
                    })
                }
                {
                    pmResults.map((pmInfo, index) => {
                       const key = pmInfo.name + index;
                       return <div key={key}>
                          {pmInfo.standardConceptCount} results available in the domain:
                          <a style={styles.domainResult} onClick={() => this.handleOnClick(pmInfo, 'pm')}>{pmInfo.name}</a>
                       </div>;
                    })
                }
                {
                    fitbitResults.map((fitbitInfo, index) => {
                       const key = fitbitInfo.name + index;
                       return <div key={key}>
                          {fitbitInfo.standardConceptCount} results available in the domain:
                          <a style={styles.domainResult} onClick={() => this.handleOnClick(fitbitInfo, 'fitbit')}>{fitbitInfo.name}</a>
                       </div>;
                    })
                }
            </div>
        </React.Fragment>;
    }
}

@Component({
  selector: 'app-domain-results-match',
  template: `<span #root></span>`,
})

export class NoResultSearchWrapperComponent extends BaseReactWrapper {
  @Input() public searchValue: string;
  @Input() public measurementTestFilter: number;
  @Input() public measurementOrderFilter: number;
  @Input() public domainMatch: Function;

  constructor() {
    super(NoResultSearchComponent, ['searchValue', 'measurementTestFilter', 'measurementOrderFilter', 'domainMatch']);
  }
}
