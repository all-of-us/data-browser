import { Component, Input } from '@angular/core';
import { BaseReactWrapper } from 'app/data-browser/base-react/base-react.wrapper';
import { TooltipReactComponent } from 'app/data-browser/components/tooltip/tooltip-react.component';
import { ConceptChartReactComponent } from 'app/data-browser/views/concept-chart/concept-chart-react.component';
import { HighlightReactComponent } from 'app/shared/components/highlight-search/HighlightReactComponent';
import { reactStyles } from 'app/utils';
import { ClrIcon } from 'app/utils/clr-icon';
import { GraphType } from 'app/utils/enum-defs';
import * as React from 'react';

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
    },
    tblRow: {
        display: 'grid',
        gridTemplateColumns: '30% 25% 20% 1fr',
        textAlign: 'left',
        minWidth: '810px',
        border: 'none'
    },
    tblRLabs: {
        display: 'grid',
        gridTemplateColumns: '30% 25% 20% 10% 1fr',
        textAlign: 'left',
        minWidth: '810px'
    },
    akaText: {
        /* width: 170px; */
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'italic',
        color: '#6B6B6B'
    },
    sourceBtnMeta: {
        width: '1.3rem',
        height: '1.3rem',
        margin: 'auto',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
    },
    measurementTypeSpan: {
        fontSize: '1em'
    },
    aka: {
        paddingLeft: '9px',
        paddingTop: '9px',
        fontSize: '.8em'
    },
    showMoreLink: {
        display: 'inline',
        color: '#216fb4',
        fontWeight: 400,
        position: 'relative',
        zIndex: 99
    },
    iconBtnGroup: {
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
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
.tbl-d:first-of-type::before {
    content: none;
}
.tbl-d:nth-of-type(4) {
    text-align: center;
}
.icon-btn {
    position: relative;
    width: 100%;
    text-align: right;
    font-size: 2.5rem;
}
.toggle-link,
 .toggle-link:link,
 .toggle-link:visited {
     color: #216fb4;
     border: none;
     outline: none;
 }
.source-btn-active {
    background: url('/assets/icons/source_btn_active.svg');
}
.source-btn {
    background: url('/assets/icons/source_btn.svg');
}
.copy-alert {
  border: 1px solid #2f2e7e;
  background: white;
  border-radius: 2px;
  font-size: 10px;
  padding: 1em;
}
`;


interface Props {
    concept: any;
    domain: any;
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
    showCopyAlert: boolean;
    selectedConcept: any;
}

export class ConceptRowReactComponent extends React.Component<Props, State> {
    versionAnalysis: any[] = [];
    myRef: any;
    constructor(props: Props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
            showMoreSynonyms: false,
            showMoreDrugBrands: false,
            showConceptChart: props.selectedConcept ? (props.selectedConcept &&
                props.selectedConcept.conceptId === props.concept.conceptId) :
                (props.searchTerm ? props.searchTerm == props.concept.conceptId : false),
            graphToShow: props.domain.name.toLowerCase() === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex,
            showCopyAlert: false,
            selectedConcept: this.props.selectedConcept
        };
    }

  componentDidMount() {
    const {selectedConcept, concept, searchTerm} = this.props;
    if (selectedConcept ? (selectedConcept && selectedConcept.conceptId === concept.conceptId) :
        (searchTerm ? searchTerm == concept.conceptId : false)) {
        this.myRef.current.scrollIntoView();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const {selectedConcept, concept, domain: {name}} = this.props;
    if (prevProps.selectedConcept !== selectedConcept) {
        if (selectedConcept.conceptId === concept.conceptId) {
            this.myRef.current.scrollIntoView();
            this.setState({
                selectedConcept: selectedConcept,
                showConceptChart: true,
                graphToShow: name.toLowerCase() === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex
            });
       } else {
           this.setState({showConceptChart: false});
       }
    }
  }

    participantPercentage(count: number) {
        const {totalParticipants} = this.props;
        return (!count || count <= 0) ? 0 : parseFloat(((count / totalParticipants) * 100).toFixed(2));
    }

    expandRow() {
        this.setState({
            showConceptChart: !this.state.showConceptChart,
            graphToShow: this.props.domain.name.toLowerCase() === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex
        });
    }

    showChart(chartType: string) {
        const {showConceptChart, graphToShow} = this.state;
        const {domain: {name}} = this.props;
        if (showConceptChart) {
            if (chartType === 'sources' && (graphToShow === GraphType.BiologicalSex ||
            graphToShow === GraphType.Age || graphToShow === GraphType.Values)) {
                this.setState({
                    graphToShow: GraphType.Sources
                });
            } else if (chartType === 'non-sources' && graphToShow === GraphType.Sources) {
                this.setState({
                    graphToShow: GraphType.Values
                });
            } else {
                this.setState({
                    showConceptChart: !showConceptChart,
                    graphToShow: chartType === 'sources' ? GraphType.Sources :
                    (name.toLowerCase() === 'labs & measurements' ? GraphType.Values : GraphType.BiologicalSex)
                });
            }
        } else {
            this.setState({
                showConceptChart: !showConceptChart,
                graphToShow: chartType === 'sources' ? GraphType.Sources : (name.toLowerCase() === 'labs & measurements'
                ? GraphType.Values : GraphType.BiologicalSex)
            });
        }
    }

    shareConcept(e: any) {
      const {concept} = this.props;
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + '?search=' + concept.conceptId);
      this.setState({
        showCopyAlert: true
      });
      setTimeout(() => {
        this.setState({showCopyAlert: false});
      }, 400);
    }

    render() {
        const {concept, domain, totalResults, maxResults, currentPage, counter, searchTerm, synonymString} = this.props;
        const {showMoreSynonyms, showMoreDrugBrands, showConceptChart, graphToShow, showCopyAlert} = this.state;
        const id = 'c' + concept.conceptId;
        const tabIndex = 0;
        const tooltipAction = 'Concept synonyms tooltip hover on concept ' + concept.conceptName;
        let conceptIndex = counter + 1;
        if (totalResults > maxResults) {
            conceptIndex = counter + ((currentPage - 1) * maxResults) + 1;
        }
        const synonymsStr = showMoreSynonyms ? synonymString : (synonymString ? synonymString.substring(0, 100) : null);
        const drugBrandsStr = showMoreDrugBrands ? concept.drugBrands.join(', ') : concept.drugBrands.slice(0, 10).join(', ');
        const tblClass = domain.name.toLowerCase() === 'labs & measurements' ? 'tbl-r-labs' : 'tbl-r';
        return <React.Fragment>
               <style>{cssStyles}</style>
               <div id={id} ref={this.myRef}>
                 <div className='tbl-exp-r' onClick={(e) => {e.stopPropagation(); this.expandRow(); }}>
                    <div className={tblClass} style={domain.name.toLowerCase() === 'labs & measurements' ? styles.tblRLabs : styles.tblRow}>
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
                        {domain.name.toLowerCase() === 'labs & measurements' && concept.measurementConceptInfo &&
                        <div className='body-lead tbl-d'>
                            {concept.measurementConceptInfo.hasValues === 1 ?
                            <span className='test-span' style={styles.measurementTypeSpan}><i className='fas fa-vial' style={{'transform': 'rotate(315deg)'}} />
                            <TooltipReactComponent tooltipKey='valueFilter' label='' searchTerm='' action='' /></span> :
                            <span className='order-span' style={styles.measurementTypeSpan}><i className='far fa-file-signature' />
                           <TooltipReactComponent tooltipKey='orderFilter' label='' searchTerm='' action='' /></span>}
                        </div>
                        }
                        <div className='body-lead tbl-d icon-btn-group' style={styles.iconBtnGroup}>
                        <button className='icon-btn' onClick={(e) => {e.stopPropagation(); this.showChart('non-sources'); }}>
                            <ClrIcon shape='bar-chart' className={(showConceptChart && graphToShow !== GraphType.Sources) ?
                            'is-solid icon-choice' : 'icon-choice'} style={{width: 20, height: 20, color: '#2691D0'}}/>
                        </button>
                        <button className='icon-btn icon-choice' onClick={(e) => {e.stopPropagation(); this.showChart('sources'); }}>
                            <div className={(showConceptChart && graphToShow === GraphType.Sources) ? 'source-btn-active' : 'source-btn'}
                            style={styles.sourceBtnMeta} >
                            </div>
                        </button>
                        <button className='icon-btn'>
                             <ClrIcon shape='share' className='icon-choice' style={{width: 20, height: 20, color: '#2691D0'}}
                             onClick={(e) => {e.stopPropagation(); this.shareConcept(e); }}>
                             </ClrIcon>
                        </button>
                        {showCopyAlert &&
                            <div style={{margin: '20px -60px 0 0', position: 'absolute'}}>
                            <div className='copy-alert'>Link copied to clipboard</div></div>}
                    </div>
                    </div>
               {synonymString &&
               <div className='body-lead aka-layout aka' style={styles.aka}>
                <div className='aka-text' style={styles.akaText}>
                    <span>Also Known As</span>
                    <TooltipReactComponent
                                        label='EHR Tooltip Hover'
                                        searchTerm={searchTerm}
                                        action={tooltipAction}
                                        tooltipKey='conceptSynonyms' />
                </div>
                <HighlightReactComponent searchTerm={searchTerm} text={synonymsStr} />
                <a tabIndex={tabIndex} className='toggle-link' onClick={() =>
                this.setState({showMoreSynonyms: !this.state.showMoreSynonyms})}>
                {(synonymString.length > 100) ? (showMoreSynonyms ? ' See Less' : <React.Fragment><ClrIcon shape='ellipsis-horizontal'
                style={{color: '#2691D0'}}/> See More</React.Fragment>) : ''}
                </a>
               </div>
               }
               {domain.name.toLowerCase() === 'drug exposures' && concept.drugBrands && concept.drugBrands.length > 0 &&
               <div className='body-lead aka-layout aka' style={styles.aka}>
               <div className='aka-text' style={styles.akaText}>
                    <span className='drug-brands-meta'>Found in these commercially branded products</span>
                    <div>
                    <a tabIndex={tabIndex} className='toggle-link brands-link' style={styles.showMoreLink}
                                    onClick={() => this.setState({showMoreDrugBrands: !this.state.showMoreDrugBrands})}>
                                    {(concept.drugBrands.length > 10) ? (showMoreDrugBrands ?
                                    <React.Fragment>See Less
                                    <ClrIcon shape='caret' style={{color: '#2691D0'}} dir='down'/>
                                    </React.Fragment> :
                                    <React.Fragment>See More
                                    <ClrIcon shape='caret' dir='right' style={{color: '#2691D0'}}/>
                                    </React.Fragment>) : ''}
                                    </a>
                    </div>
                    <HighlightReactComponent searchTerm={searchTerm} text={drugBrandsStr} />
               </div>
               </div>
               }
               {showConceptChart && graphToShow &&
               <div className='row-expansion'>
                <div className='concept-chart'>
                    <ConceptChartReactComponent concept={concept} domain={domain} searchTerm={searchTerm}
                    graphToShow={graphToShow} key={graphToShow}/>
                </div>
               </div>
               }
               </div>
               </div>
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
