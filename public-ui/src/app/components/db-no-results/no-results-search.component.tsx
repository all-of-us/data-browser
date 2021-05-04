import { Component, Input, ViewEncapsulation } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { LoadingDots } from 'app/utils/spinner';
import { environment } from 'environments/environment';
import { domainToRoute, surveyIdToRoute } from 'app/utils/constants';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';
import {navigate, navigateByUrl} from 'app/utils/navigation';

const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

const styleCss =
`
h5{
  padding-bottom:1em;
}
.loading-text {
  font-family: "GothamBook", "Arial", sans-serif;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  font-size: 16px;
  letter-spacing: normal;
  text-align: left;
  color: #262262;
  padding-left: 0;
}
.spinner-div {
    margin-top: 1em;
    margin-bottom: 0.2em;
    margin-left: 0.5em;
}
.loading-div {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 1em;
}
.no-results {
  margin-top:-1rem;
  padding:1em;
}
.loading-dots {
    width:2rem;
    display:flex;
    height:auto;
    justify-content:space-between;
}
.loading-dots .dot {
    width:.25rem;
    height:.25rem;
    background:transparent;
    border-radius: 50%;
    animation:load 1s linear infinite alternate;
}
.loading-dots .dot:first-of-type{
    animation-delay: .25s;
}
.loading-dots .dot:nth-of-type(2){
    animation-delay: .5s;
}
.loading-dots .dot:nth-of-type(3){
    animation-delay: .75s;
}
.loading-dots .dot:nth-of-type(4){
    animation-delay: 1s;
}
a:link,a:visited,a{
    color:#2aa3d8;
}

@keyframes load {
    from{background:transparent}
    to{background:#302c70}
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
    loading: boolean;
}

export const NoResultSearchComponent = (class extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.handleOnClick = this.handleOnClick.bind(this);
        this.state = {
            domainInfoResults: [],
            surveyModuleResults: [],
            pmResults: [],
            loading: false
        };
    }

    componentDidMount() {
        this.fetchDomainTotals();
    }

    fetchDomainTotals() {
        const {searchValue, measurementTestFilter, measurementOrderFilter} = this.props;
        this.setState({loading: true});
        api.getDomainTotals(searchValue, measurementTestFilter, measurementOrderFilter).then(
                result => {
                    console.log(result.domainInfos);
                    result.domainInfos = result.domainInfos.filter(domain =>
                                        domain.standardConceptCount > 0);
                    console.log(result.domainInfos);
                    this.setState({domainInfoResults: result.domainInfos.filter(
                    domain => domain.name.toLowerCase() !== 'physical measurements' &&
                    domain.name.toLowerCase() !== 'fitbit'),
                    surveyModuleResults: result.surveyModules,
                    pmResults: result.domainInfos.filter(
                    domain => domain.name.toLowerCase() === 'physical measurements')});
                    this.setState({loading: false});
                });
    }

    handleOnClick(domainInfo: any, type: string) {
        const {searchValue} = this.props;
        let url = '';
        console.log(type);
        if (type === 'ehr') {
            localStorage.setItem('ehrDomain', JSON.stringify(domainInfo));
            url += 'ehr/' + domainToRoute[domainInfo.domain.toLowerCase()];
            url += '?search=' + searchValue;
            this.props.domainMatch();
            navigateByUrl(url);
        } else if (type === 'survey') {
            localStorage.setItem('surveyModule', JSON.stringify(domainInfo));
            url += 'survey/' + surveyIdToRoute[domainInfo.conceptId];
            url += '?search=' + searchValue;
            this.props.domainMatch();
            navigateByUrl(url);
        } else if (type === 'pm') {
            url += 'physical-measurements/' + '/' + searchValue;
            console.log(url);
            navigateByUrl(url);
        }
    }

    render() {
        const {searchValue} = this.props;
        return (
            <React.Fragment>
            <style>{styleCss}</style>
            <div className='no-results'>
                { this.state.loading ?
                <div className='loading-div'>
                    <p className='loading-text'>Searching whole site for <strong>{searchValue} </strong></p>
                    <div className='spinner-div'><LoadingDots /></div>
                </div>
                : null
                }
                {
                 this.state.domainInfoResults.map((domainInfo, index) => {
                    const key = domainInfo.name + index;
                    return <div key={key}>{domainInfo.standardConceptCount} results available in the domain: <a onClick={() => this.handleOnClick(domainInfo, 'ehr')}>{domainInfo.name}</a></div>;
                 })
                }
                {
                this.state.surveyModuleResults.map((surveyInfo, index) => {
                    const key = surveyInfo.name + index;
                    return <div key={key}>{surveyInfo.questionCount} related questions in survey: <a onClick={() => this.handleOnClick(surveyInfo, 'survey')}>{surveyInfo.name}</a></div>;
                })
                }
                {
                this.state.pmResults.map((pmInfo, index) => {
                   const key = pmInfo.name + index;
                   return <div key={key}>{pmInfo.standardConceptCount} results available in the domain: <a onClick={() => this.handleOnClick(pmInfo, 'pm')}>{pmInfo.name}</a></div>;
                })
                }
            </div>
            </React.Fragment>
        );
      }
});

@Component({
  selector: 'app-domain-results-match',
  template: `<span #root></span>`,
  encapsulation: ViewEncapsulation.None,
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