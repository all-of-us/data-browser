import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ConceptChartReactComponent } from 'app/data-browser/views/concept-chart/concept-chart-react.component';
import { ConceptRowReactComponent } from 'app/data-browser/views/ehr-view/components/concept-row-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent';
import { dataBrowserApi } from 'app/services/swagger-fetch-clients';
import { Domain, MatchType, StandardConceptFilter } from 'publicGenerated/fetch';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { PM_CONCEPTS } from 'app/utils/constants';
import { GraphType } from 'app/utils/enum-defs';
import { Spinner } from 'app/utils/spinner';
import * as React from 'react';
import ReactPaginate from 'react-paginate';

const cssStyles = `
.tbl-exp-r {
    border: 1px solid #CCCCCC;
    border-bottom: none;
    cursor: pointer;
    transition: .2s background ease-out;
    padding: 9px;
    padding-top:20px;
    min-width: 810px;
}
.tbl-exp-r *.tbl-exp-r {
    border-left: none;
    border-right: none;
    padding: 0.5rem 0;
    min-width: auto;
}

.tbl-exp-r:last-of-type {
    border-bottom: 1px solid #CCCCCC;
}

.tbl-exp-r:hover {
    background: #f6f6f8;
    transition: .1s background ease-in;
}
.tbl-exp-r:first-of-type {
    border-top: none;
}
`;

interface Props {
    domain: any;
    totalResults: number;
    maxResults: number;
    currentPage: number;
    searchTerm: string;
    totalParticipants: number;
    selectedConcept: any;
    numPages: number;
}

interface State {
    concepts: any;
    standardConcepts: any;
    top10Results: any;
    pageCount: number;
    currentPage: number;
    numPages: number;
    domain: any;
    maxResults: any;
    searchTerm: string;
    loading: boolean;
    totalResults: number;
}

export class ConceptTableReactComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            concepts: [],
            standardConcepts: [],
            top10Results: [],
            pageCount: 5,
            currentPage: props.currentPage,
            numPages: props.numPages,
            domain: props.domain,
            maxResults: props.maxResults,
            searchTerm: props.searchTerm,
            loading: true,
            totalResults: props.totalResults
        };
    }

    componentDidMount() {
        var searchRequest = {
            query: this.props.searchTerm,
            domain: this.props.domain.domain.toUpperCase(),
            standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
            maxResults: this.props.maxResults,
            minCount: 1,
            pageNumber: this.props.currentPage - 1,
        };
        this.fetchConcepts(searchRequest);
    }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.searchTerm !== this.state.searchTerm) {
        var searchRequest = {
            query: this.props.searchTerm,
            domain: this.state.domain.domain.toUpperCase(),
            standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
            maxResults: this.state.maxResults,
            minCount: 1,
            pageNumber: this.state.currentPage
        };
        this.setState({searchTerm: this.props.searchTerm, loading: true}, () => {this.getDomainTotals(); this.fetchConcepts(searchRequest);});
    }
  }

    fetchConcepts(searchRequest: any) {
        dataBrowserApi().searchConcepts(searchRequest)
            .then(results => {
                    this.processSearchResults(results);
            }).catch(e => {
                    console.log(e, 'error');
       });
    }

    public processSearchResults(results) {
        results.items.filter(
            x => PM_CONCEPTS.indexOf(x.conceptId) === -1);
        results.items.sort((a, b) => {a.countValue < b.countValue});
        var medlineTerm = this.props.searchTerm ? this.props.searchTerm : '';
        if (results.matchType === MatchType.ID || results.matchType === MatchType.CODE) {
              medlineTerm = results.matchedConceptName;
        }
        var medlinePlusLink = 'https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=' +
            'medlineplus&v%3Asources=medlineplus-bundle&query='
            + medlineTerm;
        for (let concept of results.items) {
            concept['synonymString'] = concept.conceptSynonyms.join(', ');
            concept['drugBrands'] = concept.drugBrands;
            if (this.props.domain.domain.toLowerCase() === 'measurement') {
                concept.graphToShow = GraphType.Values;
            } else {
                concept.graphToShow = GraphType.BiologicalSex;
            }
        }
        let standardConcepts = [];
        if (results.standardConcepts) {
            standardConcepts = results.standardConcepts;
        }
        let top10Results = [];
        if (this.props.currentPage === 1) {
            top10Results = results.items.slice(0, 10);
        }
        this.setState({concepts: results.items, standardConcepts: standardConcepts, top10Results: top10Results, loading: false});
  }

  handlePageClick = (data) => {
    var searchRequest = {
        query: this.state.searchTerm,
        domain: this.state.domain.domain.toUpperCase(),
        standardConceptFilter: StandardConceptFilter.STANDARDORCODEIDMATCH,
        maxResults: this.state.maxResults,
        minCount: 1,
        pageNumber: data.selected
    };
    this.setState({currentPage: data.selected + 1});
    window.scrollTo(0, 0);
    this.fetchConcepts(searchRequest);
  };

     getDomainTotals() {
      dataBrowserApi().getDomainTotals(this.state.searchTerm, 1, 1)
                  .then(results => {
                      results.domainInfos.forEach(domain => {
                          const thisDomain = Domain[domain.domain];
                          if (thisDomain && thisDomain.toLowerCase() === this.props.domain.domain.toLowerCase()) {
                            let numPages = Math.ceil(domain.standardConceptCount / 50);
                            let totalConceptCount = domain.standardConceptCount;
                            this.setState({numPages: numPages, totalResults: totalConceptCount});
                          }
                  });
                  }).catch(e => {
                          console.log(e, 'error');
             });
     }

    render() {
        const {loading, totalResults, currentPage, concepts, searchTerm} = this.state;
        return <React.Fragment>
        <style>{cssStyles}</style>
        {loading && <Spinner />}
        <div className='results-grid'>
            <div className='domain-info-layout'>
                <span>
                    {(totalResults <= 50) ? <h5 id='domain-name' className='primary-display'>Showing top {totalResults}
                    {searchTerm ? <React.Fragment> matching medical concepts </React.Fragment> : <React.Fragment> concepts for this domain</React.Fragment>}
                    <TooltipReactComponent tooltipKey='matchingConceptsHelpText'
                                                                   label='EHR Tooltip Hover' searchTerm={searchTerm}
                                                                   action='Matching medical concepts tooltip hover' />
                    </h5> :
                    <h5 id='domain-name' className='primary-display'>Showing top {((currentPage-1) * 50)+1} - {concepts.length + (currentPage * 50)} of {totalResults}
                    {searchTerm ? <React.Fragment> matching medical concepts </React.Fragment> : <React.Fragment> concepts for this domain</React.Fragment>}
                    <TooltipReactComponent tooltipKey='matchingConceptsHelpText'
                                               label='EHR Tooltip Hover' searchTerm={searchTerm}
                                               action='Matching medical concepts tooltip hover' /> </h5> }
                </span>
            </div>
        </div>
        </React.Fragment>;
    }
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-concept-table-react',
    template: `<span #root></span>`,
})

export class ConceptTableWrapperComponent extends BaseReactWrapper {
    @Input() domain: string;
    @Input() maxResults: number;
    @Input() currentPage: number;
    @Input() searchTerm: string;
    @Input() totalParticipants: number;
    @Input() selectedConcept: any;
    @Input() numPages: number;

    constructor() {
        super(ConceptTableReactComponent, ['domain', 'maxResults', 'currentPage', 'searchTerm', 'totalParticipants', 'selectedConcept', 'numPages']);
    }
}
