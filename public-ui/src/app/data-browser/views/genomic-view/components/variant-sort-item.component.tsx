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
    paddingTop:".25rem"
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
    overflow:'hidden'
    // wordWrap: "break-word",
  }
});

const css = `
`;

interface Props {
    cleared: Boolean;
    onSortChange: Function;
    sortMetadata: SortMetadata;
}

interface State {
  sortItemOpen: Boolean;
  sortMetadata: SortMetadata;
}

export class VariantSortItemComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        sortItemOpen: false,
        sortMetadata: props.sortMetadata,
    };
  }

  sortClick() {
    this.setState({ sortItemOpen: !this.state.sortItemOpen });
  }

  onSortClick(event) {
    const { sortMetadata } = this.state;
    let event_split = event.target.value.split('_');
    const key = event_split[0];
    const direction = event_split[1];

    sortMetadata[key].sortActive = true;
    sortMetadata[key].sortDirection = direction;

    for (const sKey in sortMetadata) {
      if (sKey !== key) {
        sortMetadata[sKey].sortActive = false;
        sortMetadata[sKey].sortDirection = "asc";
      }
    }

    this.setState({ sortMetadata: sortMetadata }, () => {
      this.props.onSortChange(this.state.sortMetadata);
    });
  }

  render(): React.ReactNode {
    const { cleared } = this.props;
    const { sortItemOpen, sortMetadata } = this.state;
    return <React.Fragment>
          <div onClick={() => this.sortClick()} style={styles.sortItem}>
          <span style={{fontFamily:'gothamBold'}}>Sort By</span>
            <div><ClrIcon style={!sortItemOpen ? { ...styles.sortItemClosed } : { ...styles.sortItemOpen }} shape='angle' /></div>
          </div>
          {(cleared && sortItemOpen) &&
                    <div style={styles.sortItemForm}  onChange={(e) => this.onSortClick(e)}>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="gene_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Gene Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="gene_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Gene Desc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="consequence_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Consequence Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="consequence_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Consequence Desc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="proteinChange_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Protein Change Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="proteinChange_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Protein Change Desc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="clinicalSignificance_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Clinical Significance Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="clinicalSignificance_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Clinical Significance Desc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="alleleCount_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Allele Count Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="alleleCount_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Allele Count Desc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="alleleNumber_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Allele Number Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="alleleNumber_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Allele Number Desc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="alleleFrequency_asc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Allele Frequency Asc</label>
                            </span>
                            <span style={styles.sortItemOption}>
                                <input type="radio" value="alleleFrequency_desc" name="sortBy" style={styles.sortItemCheck} />
                                <label style={styles.sortItemLabel}>Allele Frequency Desc</label>
                            </span>
                    </div>}
    </React.Fragment>;
  }
}