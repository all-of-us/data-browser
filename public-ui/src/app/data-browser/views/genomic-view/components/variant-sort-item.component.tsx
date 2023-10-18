import * as React from "react";
import { TooltipReactComponent } from "app/data-browser/components/tooltip/tooltip-react.component";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { SortMetadata } from "publicGenerated/fetch";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

const styles = reactStyles({
  sortItem: {
    width: "100%",
    paddingLeft: ".5rem",
    fontSize: "0.8em",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#262262",
    letterSpacing: 0,
    lineHeight: "16px",
    cursor: "pointer"
  },
  sortItemClosed: {
    transform: "rotate(90deg)",
  },
  sortItemOpen: {
    transform: "rotate(180deg)",
  },
  sortItemForm: {
    fontSize: "0.8em",
    display: "flex",
    overflow: 'visible',
    flexDirection: "column",
    paddingLeft: "1rem",
    paddingTop: ".25rem",
  },
  sortItemOption: {
    fontSize: ".8em",
    display: "flex",
  },
  sortItemCheck: {
    marginRight: ".25rem",
    height: ".8rem",
    width: ".8rem",
    marginTop: "0.1rem",
  },
  sortItemLabel: {
    width: '80%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
    // wordWrap: "break-word",
  },
  activeSort: {
    fontFamily: 'gothamBold'
  }
});

const css = `
.tooltip {
    position: relative;
    display: inline-block;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 185px;
    font-size: 14px;
    font-family: GothamBook, Arial, sans-serif;
    background-color: #FFFFFF;
    color: #302C71;
    text-align: left;
    border-spacing: 5px;
    padding: 5px;
    position: absolute;
    z-index: 9999;
    bottom: 125%;
    left: 10%;
}

.tooltip:focus .tooltiptext, .tooltip:hover .tooltiptext {
    visibility: visible;
}

.tooltiptext {
    margin: 3%;
    line-height: normal;
    outline: 2px solid #302C71;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.15);
}
`;

const lables = {
  gene: 'Gene',
  consequence: 'Consequence',
  clinicalSignificance: 'ClinVar Significance',
  alleleNumber: 'Allele Number',
  alleleFrequency: 'Allele Frequency',
  alleleCount: 'Allele Count'
};

interface Props {
  cleared: Boolean;
  onSortChange: Function;
  sortMetadata: SortMetadata;
}

interface State {
  sortItemOpen: Boolean;
  sortMetadata: SortMetadata;
  filterCats: any[];
  sortCats: any[];
}

export class VariantSortItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sortItemOpen: false,
      sortMetadata: props.sortMetadata,
      filterCats: [
        { display: 'Gene', field: 'gene' },
        { display: 'Consequence', field: 'consequence' },
        { display: 'Protein Change', field: 'proteinChange' },
        { display: 'ClinVar Significance', field: 'clinicalSignificance' },
        { display: 'Allele Count', field: 'alleleCount' },
        { display: 'Allele Number', field: 'alleleNumber' },
        { display: 'Allele Frequency', field: 'alleleFrequency' },
      ],
      sortCats: [
        { display: 'Variant ID', field: 'variantId'},
        { display: 'Gene', field: 'gene' },
        { display: 'Consequence', field: 'consequence' },
        { display: 'Protein Change', field: 'proteinChange' },
        { display: 'ClinVar Significance', field: 'clinicalSignificance' },
        { display: 'Allele Count', field: 'alleleCount' },
        { display: 'Allele Number', field: 'alleleNumber' },
        { display: 'Allele Frequency', field: 'alleleFrequency' },
      ]
    };
  }

  componentDidMount(): void {
  }

  sortClick() {
    this.setState({ sortItemOpen: !this.state.sortItemOpen });
  }



  clickToSort(field) {
    const { sortMetadata } = this.state;

    if (sortMetadata[field].sortActive) {
      if (sortMetadata[field].sortDirection === 'asc') {
        sortMetadata[field].sortDirection = 'desc'
      } else {
        sortMetadata[field].sortDirection = 'asc'
      }
      for (const item in sortMetadata) {
        if (item !== field) {
          sortMetadata[item].sortActive = false;
          sortMetadata[item].sortDirection = 'desc';
        }
      }
    } else {
      sortMetadata[field].sortActive = true;
      for (const item in sortMetadata) {
        if (item !== field) {
          sortMetadata[item].sortActive = false;
          sortMetadata[item].sortDirection = 'asc';
        }
      }
    }
    this.setState({ sortMetadata: this.state.sortMetadata });
  }

  render(): React.ReactNode {
    const { cleared } = this.props;
    const { sortItemOpen, sortMetadata, filterCats, sortCats } = this.state;

    return <React.Fragment>
      <style>{css}</style>
      <div onClick={() => this.sortClick()} style={styles.sortItem}>
        <span style={{ fontFamily: 'gothamBold' }}>Sort By</span>
        <div><ClrIcon style={!sortItemOpen ? { ...styles.sortItemClosed } : { ...styles.sortItemOpen }} shape='angle' /></div>
      </div>
      {(cleared && sortItemOpen) &&
        <div style={styles.sortItemForm}>
          {sortCats && sortCats.map((cat, index) => {
            return <div style={{ cursor: 'pointer', position: 'relative' }} key={index} onClick={(e) => this.clickToSort(cat.field)}>
              <span style={sortMetadata[cat.field].sortActive ? styles.activeSort : {}}>
                <div className="tooltip">{cat.display}
                    <span className="tooltiptext">Click to select <br/>ascending or descending</span>
                </div>
              {sortMetadata[cat.field].sortActive && sortMetadata[cat.field].sortDirection === 'asc' &&
                <FontAwesomeIcon icon={faArrowUp}  aria-hidden="true"
                style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}/>}
              {sortMetadata[cat.field].sortActive && sortMetadata[cat.field].sortDirection === 'desc' &&
              <FontAwesomeIcon icon={faArrowDown}  aria-hidden="true"
               style={{ color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer' }}/>}
            </span>
            </div>
          })}
        </div>}
    </React.Fragment>;
  }
}