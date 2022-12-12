import * as React from "react";
import { reactStyles } from "app/utils";
import { ClrIcon } from "app/utils/clr-icon";
import { SortMetadata } from "publicGenerated/fetch";

const styles = reactStyles({
  sortItem: {
    width: "100%",
    padding: ".5rem",
    paddingBottom: "0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#262262",
    fontSize: ".8em",
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
    display: "flex",
    overflow: 'hidden',
    flexDirection: "column",
    paddingLeft: "1rem",
    paddingTop: ".25rem"
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
  cats: any[];
}

export class VariantSortItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sortItemOpen: false,
      sortMetadata: props.sortMetadata,
      cats: [
        { display: 'Gene', field: 'gene' },
        { display: 'Consequence', field: 'consequence' },
        { display: 'Protein Change', field: 'proteinChange'},
        { display: 'ClinVar Significance', field: 'clinicalSignificance' },
        { display: 'Allele Count', field: 'alleleCount' },
        { display: 'Allele Number', field: 'alleleNumber' },
        { display: 'Allele Frequency', field: 'alleleFrequency' },
      ]
    };

    console.log(props.sortMetadata);
  }


  sortClick() {
    this.setState({ sortItemOpen: !this.state.sortItemOpen });
  }

 

  clickToSort(field) {
    this.state.sortMetadata[field].sortActive = true;
    if (this.state.sortMetadata[field].sortDirection === 'asc') {
      this.state.sortMetadata[field].sortDirection = 'desc'
    } else {
      this.state.sortMetadata[field].sortDirection = 'asc'
    }
    if (this.state.sortMetadata[field].sortActive) {
      for (const item in this.state.sortMetadata) {
        if (item !== field) {
          this.state.sortMetadata[item].sortActive = false;
        }
      }
    }
    this.setState({ sortMetadata: this.state.sortMetadata });
  }

  render(): React.ReactNode {
    const { cleared } = this.props;
    const { sortItemOpen, sortMetadata, cats } = this.state;

    let sortMetadataFlags = {
      'gene': { 'asc': false, 'desc': false },
      'consequence': { 'asc': false, 'desc': false },
      'proteinChange': { 'asc': false, 'desc': false },
      'clinicalSignificance': { 'asc': false, 'desc': false },
      'alleleCount': { 'asc': false, 'desc': false },
      'alleleNumber': { 'asc': false, 'desc': false },
      'alleleFrequency': { 'asc': false, 'desc': false },
    };

    for (const smKey in sortMetadata) {
      if (sortMetadata[smKey].sortActive) {
        sortMetadataFlags[smKey][sortMetadata[smKey].sortDirection] = true;
      }
    }

    return <React.Fragment>
      <div onClick={() => this.sortClick()} style={styles.sortItem}>
        <span style={{ fontFamily: 'gothamBold' }}>Sort By</span>
        <div><ClrIcon style={!sortItemOpen ? { ...styles.sortItemClosed } : { ...styles.sortItemOpen }} shape='angle' /></div>
      </div>
      {(cleared && sortItemOpen) &&
        <div style={styles.sortItemForm}>
          {cats && cats.map((cat, index) => {
            return <div style={{cursor:'pointer'}} key={index}>
              <span style={sortMetadata[cat.field].sortActive ? styles.activeSort : {}} onClick={(e) => this.clickToSort(cat.field)}>{cat.display}</span>
              {sortMetadata[cat.field].sortActive && sortMetadata[cat.field].sortDirection === 'asc' && <i className="fas fa-arrow-up" aria-hidden="true" style={{color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer'}}></i>}
              {sortMetadata[cat.field].sortActive && sortMetadata[cat.field].sortDirection === 'desc' && <i className="fas fa-arrow-down" aria-hidden="true" style={{color: 'rgb(33, 111, 180)', marginLeft: '0.5em', cursor: 'pointer'}}></i>}
            </div>
          })}
        </div>}
    </React.Fragment>;
  }
}