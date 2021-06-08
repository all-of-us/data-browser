import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ConceptChartReactComponent } from 'app/data-browser/views/concept-chart/concept-chart-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { GraphType } from 'app/utils/enum-defs';
import { environment } from 'environments/environment';
import { Configuration, DataBrowserApi } from 'publicGenerated/fetch';
import * as React from 'react';


const api = new DataBrowserApi(new Configuration({ basePath: environment.publicApiUrl }));

const styles = reactStyles({
    bodyLead: {
        fontFamily: 'GothamBook, Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontStretch: 'normal',
        letterSpacing: 'normal',
        textAlign: 'left',
        padding: '0 .5rem',
        fontSize: '.8em',
        position: 'relative'
    }
});

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
.tbl-exp-r:first-of-type {
    border-top: none;
}
.tbl-exp-r *.tbl-exp-r {
    border-left: none;
    border-right: none;
    padding: 0.5rem 0;
    min-width: auto;
}
.tbl-exp-r:hover {
    background: #f6f6f8;
    transition: .1s background ease-in;
}
.tbl-r {
    display: grid;
    grid-template-columns: 30% 25% 20% 1fr;
    text-align: left;
    min-width: 810px;
    border: none;
}
.tbl-r-labs {
    display: grid;
    grid-template-columns: 30% 25% 20% 10% 1fr;
    text-align: left;
    min-width: 810px;
}
.tbl-d:first-of-type::before {
    content: none;
}
.tbl-d:nth-of-type(4) {
    text-align: center;
}
.source-btn-active {
    background: url('/assets/icons/source_btn_active.svg');
}

.source-btn {
    background: url('/assets/icons/source_btn.svg');
}

.source-btn, .source-btn-active {
    width: 1.3rem;
    height: 1.3rem;
    margin: auto;
    background-repeat: no-repeat;
    background-size: 100% 100%;
}
.icon-btn-group {
    text-align: right;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
}
.icon-btn-group .icon-btn {
    font-size: 2.5rem;
}
.icon-btn {
    position: relative;
    width: 100%;
    text-align: right;
}
.aka-text {
    /* width: 170px; */
    font-family: Arial, sans-serif;
    font-style: italic;
    color: #6B6B6B;
}

.aka-info {
    opacity: .7;
}

.aka {
    padding-left: 9px;
    padding-top: 9px;
    font-size: 14px;
}

.aka-layout {
    font-size: .8em;
}

.see-more, .see-less, .brands-link {
    display: inline;
    color: #216fb4;
    font-weight: 400;
    position: relative;
    z-index: 99;
}
.toggle-link,
 .toggle-link:link,
 .toggle-link:visited {
     color: #216fb4;
     border: none;
     outline: none;
 }

.test-span, .order-span {
    font-size: 1em;
}
`;


interface Props {
    concept: any;
    domain: string;
    totalResults: number;
    maxResults: number;
    currentPage: number;
    counter: number;
    searchTerm: string;
    totalParticipants: number;
    synonymString: string;
    selectedConcept: any;
}

interface State {
    showConceptChart: boolean;
    showMoreSynonyms: boolean;
    showMoreDrugBrands: boolean;
    graphToShow: string;
}

export class ConceptRowReactComponent extends React.Component<Props, State> {
    versionAnalysis: any[] = [];
    constructor(props: Props) {
        super(props);
        this.state = {
            showMoreSynonyms: false,
            showMoreDrugBrands: false,
            showConceptChart: this.props.selectedConcept && this.props.selectedConcept.conceptId === this.props.concept.conceptId ? true : false,
            graphToShow: this.props.domain === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex,
        };
    }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.selectedConcept !== this.props.selectedConcept && this.props.selectedConcept.conceptId === this.props.concept.conceptId) {
        this.setState({
            showConceptChart: true,
            graphToShow: this.props.domain === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex,
        });
    }
    if (this.props.selectedConcept && this.props.selectedConcept.conceptId !== this.props.concept.conceptId && this.state.showConceptChart) {
        this.setState({
            showConceptChart: false
        });
    }
  }

    participantPercentage(count: number) {
      const {totalParticipants} = this.props;
      if (!count || count <= 0) { return 0; }
      let percent: number = count / totalParticipants;
      percent = percent * 100;
      return parseFloat(percent.toFixed(2));
    }

    toggleSynonyms() {
        this.setState({
            showMoreSynonyms: !this.state.showMoreSynonyms
        });
    }

    toggleDrugBrands() {
        this.setState({
            showMoreDrugBrands: !this.state.showMoreDrugBrands
        });
    }

    expandRow() {
        this.setState({
            showConceptChart: !this.state.showConceptChart,
            graphToShow: this.props.domain === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex
        });
    }

    showChart(chartType: string) {
        if (this.state.showConceptChart) {
            if (chartType === 'sources' && (this.state.graphToShow === GraphType.BiologicalSex || this.state.graphToShow === GraphType.Age || this.state.graphToShow === GraphType.Values)) {
                this.setState({
                    graphToShow: GraphType.Sources
                });
            } else if (chartType === 'non-sources' && this.state.graphToShow === GraphType.Sources) {
                this.setState({
                    graphToShow: GraphType.Values
                });
            } else {
                this.setState({
                    showConceptChart: !this.state.showConceptChart,
                    graphToShow: chartType === 'sources' ? GraphType.Sources : (this.props.domain === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex)
                });
            }
        } else {
            this.setState({
                showConceptChart: !this.state.showConceptChart,
                graphToShow: chartType === 'sources' ? GraphType.Sources : (this.props.domain === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex)
            });
        }
    }

    shareConcept(e: any) {
      const {concept} = this.props;
      const el = document.createElement('input');
      el.value = window.location.origin + window.location.pathname +
                       '?search=' + concept.conceptId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.clickAlertBox('Link copied to clipboard', e);
    }

    clickAlertBox(message: string, e: any) {
          const alertBox = document.createElement('div');
          alertBox.style.position = 'absolute';
          alertBox.style.top = e.pageY + 10 + 'px';
          alertBox.style.left = e.pageX - 60 + 'px';
          alertBox.innerHTML =
            `<div class="copy-alert">
            ${message}
          </div>`;
          // alertBox.innerText = message;
          document.body.appendChild(alertBox);
          setTimeout(() => {
            document.body.removeChild(alertBox);
          }, 400);
      }

    render() {
        const {concept, domain, totalResults, maxResults, currentPage, counter, searchTerm, synonymString} = this.props;
        const {showMoreSynonyms, showMoreDrugBrands, showConceptChart, graphToShow} = this.state;
        const id = 'c' + concept.conceptId;
        const tabIndex = 0;
        const tooltipAction = 'Concept synonyms tooltip hover on concept ' + concept.conceptName;
        var conceptIndex = counter+1;
        if (totalResults > maxResults) {
            conceptIndex = counter+((currentPage-1) * maxResults)+1;
        }
        const synonymsStr = showMoreSynonyms ? synonymString : (synonymString ? synonymString.substring(0,100) : null);
        const drugBrandsStr = showMoreDrugBrands ? concept.drugBrands.join(', ') : concept.drugBrands.slice(0, 10).join(', ');
        const tblClass = this.props.domain === 'labs & measurements' ? 'tbl-r-labs' : 'tbl-r';
        return <React.Fragment>
               <style>{cssStyles}</style>
               <div id={id}>
                 <div className='tbl-exp-r' onClick={() => this.expandRow()}>
                 <div className={tblClass}>
                 <div className='body-lead tbl-d' style={styles.bodyLead}>
                    <span>{conceptIndex}. </span>
                    <HighlightReactComponent searchTerm={searchTerm} text={concept.conceptName}/>
                 </div>
                 <div className='body-lead tbl-d' style={styles.bodyLead}>
                    {concept.countValue <= 20 && <span>&le; </span>} {concept.countValue.toLocaleString()}
                 </div>
                 <div className='body-lead tbl-d' style={styles.bodyLead}>
                    {this.participantPercentage(concept.countValue)} %
                 </div>
                 {domain === 'labs & measurements' && concept.measurementConceptInfo &&
                 <div className='body-lead tbl-d'>
                    {concept.measurementConceptInfo.hasValues === 1 ?
                    <span className='test-span'><i className='fas fa-vial' style={{'transform': 'rotate(315deg)'}}></i>
                    <TooltipReactComponent tooltipKey='valueFilter' label='' searchTerm='' action=''></TooltipReactComponent></span> :
                    <span className='order-span'><i className='far fa-file-signature'></i>
                   <TooltipReactComponent tooltipKey='orderFilter' label='' searchTerm='' action=''></TooltipReactComponent></span>}
                 </div>
                 }
                 <div className='body-lead tbl-d icon-btn-group'>
                    <button className='icon-btn' onClick={(e)=> {e.stopPropagation(); this.showChart('non-sources')}}>
                        <ClrIcon shape='bar-chart' className={(showConceptChart && graphToShow !== GraphType.Sources) ? 'is-solid icon-choice' : 'icon-choice'} style={{width: 20, height: 20, color: '#2691D0'}}/>
                    </button>
                    <button className='icon-btn icon-choice' onClick={(e)=> {e.stopPropagation(); this.showChart('sources')}}>
                        <div className={(showConceptChart && graphToShow === GraphType.Sources) ? 'source-btn-active' : 'source-btn'}>
                        </div>
                    </button>
                    <button className='icon-btn'>
                         <ClrIcon shape='share' className='icon-choice' style={{width: 20, height: 20, color: '#2691D0'}} onClick={(e)=> {e.stopPropagation(); this.shareConcept(e)}}>
                         </ClrIcon>
                    </button>
                 </div>
                 </div>
                 </div>
               </div>
               {synonymString &&
               <div className='body-lead aka-layout aka'>
                <div className='aka-text'>
                    <span>Also Known As</span>
                    <TooltipReactComponent
                                        label='EHR Tooltip Hover'
                                        searchTerm={searchTerm}
                                        action={tooltipAction}
                                        tooltipKey='conceptSynonyms' />
                </div>
                <HighlightReactComponent searchTerm={searchTerm} text={synonymsStr}>
                </HighlightReactComponent>
                <a tabIndex={tabIndex} className='toggle-link' onClick={() => this.toggleSynonyms()}>
                {(synonymString.length > 100) ? (showMoreSynonyms ? ' See Less' : <React.Fragment><ClrIcon shape='ellipsis-horizontal' style={{color: '#2691D0'}}/> See More</React.Fragment>) : ''}
                </a>
               </div>
               }
               {domain === 'drug exposures' && concept.drugBrands && concept.drugBrands.length > 0 &&
               <div className='body-lead aka-layout aka'>
               <div className='aka-text'>
                    <span className='drug-brands-meta'>Found in these commercially branded products</span>
                    <div>
                    <a tabIndex={tabIndex} className='toggle-link brands-link' onClick={() => this.toggleDrugBrands()}>
                                    {(concept.drugBrands.length > 10) ? (showMoreDrugBrands ? <React.Fragment>See Less<ClrIcon shape='caret' style={{color: '#2691D0'}} dir='down'/></React.Fragment> : <React.Fragment>See More<ClrIcon shape='caret' dir='right' style={{color: '#2691D0'}}/></React.Fragment>) : ''}
                                    </a>
                    </div>
                    <HighlightReactComponent searchTerm={searchTerm} text={drugBrandsStr}>
                    </HighlightReactComponent>
               </div>
               </div>
               }
               {showConceptChart && graphToShow &&
               <div className='row-expansion'>
                <div className='concept-chart'>
                    <ConceptChartReactComponent concept={concept} domain={domain} searchTerm={searchTerm} graphToShow={graphToShow} key={graphToShow}/>
                </div>
               </div>
               }
               </React.Fragment>;
    }
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'app-concept-row-react',
    template: `<span #root></span>`,
})

export class ConceptRowWrapperComponent extends BaseReactWrapper {
    @Input() concept: any;
    @Input() domain: string;
    @Input() totalResults: number;
    @Input() maxResults: number;
    @Input() currentPage: number;
    @Input() counter: number;
    @Input() searchTerm: string;
    @Input() totalParticipants: number;
    @Input() synonymString: any;
    @Input() selectedConcept: any;

    constructor() {
        super(ConceptRowReactComponent, ['concept', 'domain', 'totalResults', 'maxResults', 'currentPage', 'counter', 'searchTerm', 'totalParticipants', 'synonymString', 'selectedConcept']);
    }
}
