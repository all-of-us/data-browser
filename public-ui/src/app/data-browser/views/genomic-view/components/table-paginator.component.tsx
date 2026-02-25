import * as React from "react";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { reactStyles } from "app/utils";

const styles = reactStyles({
  pageNum: {
    alignSelf: "flex-end",
    fontSize: "12px",
    marginTop: "1em",
    marginBottom: "1em",
  },
  pageButton: {
    textDecoration: "none",
    display: "inline-block",
    marginRight: "1em",
    marginLeft: "1em",
    color: "black",
    border: "1px solid rgb(33, 111, 180)",
    background: "none",
    cursor: "pointer",
  },
  disabledPageButton: {
    textDecoration: "none",
    display: "inline-block",
    marginRight: "1em",
    marginLeft: "1em",
    color: "grey",
    border: "1px solid rgb(33, 111, 180)",
    background: "none",
    cursor: "none",
    pointerEvents: "none",
  },
  enabledIcon: {
    color: "black",
  },
  disabledIcon: {
    color: "#ddd",
  },
});

const css = `
    .paginator {
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
    }
    .page-drop-down-label {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 1em;
        justify-content: space-between;
        gap: 1em;
    }
    @media (max-width: 600px) {
        .paginator {
            flex-direction: column;
            align-items: flex-end;
            gap: 0;
            justify-content: flex-end;
        }
    }
`;

interface Props {
  pageCount: number;
  variantListSize: number;
  currentPage: number;
  resultsSize: number;
  onPageChange: Function;
  rowCount: number;
  onRowCountChange: Function;
}

interface State {
  currentPage: number;
  rowCount: number;
}

export class TablePaginatorComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentPage: props.currentPage ? props.currentPage : 1,
      rowCount: props.rowCount ? props.rowCount : 50,
    };
  }

  handleChange(event) {
    this.setState({ currentPage: +event.target.value }, () => {
      this.props.onPageChange(this.state.currentPage);
    });
  }

  rowCountChange(event) {
    this.setState({ rowCount: +event.target.value }, () => {
      this.props.onRowCountChange(this.state.rowCount);
    });
  }

  render() {
    const { currentPage } = this.state;
    const { pageCount } = this.props;
    return (
      <React.Fragment>
        <style>{css}</style>
        {/*
        <div style={styles.pageNum}>
          <label className="page-drop-down-label">
            Showing at a time
            <select value={rowCount} onChange={this.rowCountChange.bind(this)}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
        */}
        <div style={styles.pageNum}>
          <button
            style={
              currentPage !== 1 ? styles.pageButton : styles.disabledPageButton
            }
            disabled={currentPage === 1}
            onClick={(_e) => {
              this.setState({ currentPage: this.state.currentPage - 1 }, () => {
                this.props.onPageChange(this.state.currentPage);
              });
            }}
          >
            <FontAwesomeIcon
              icon={faAngleLeft}
              style={
                currentPage !== 1 ? styles.enabledIcon : styles.disabledIcon
              }
            />
          </button>
          Page {currentPage} of {pageCount}
          <button
            style={
              currentPage !== pageCount
                ? styles.pageButton
                : styles.disabledPageButton
            }
            disabled={currentPage === pageCount}
            onClick={(_e) => {
              this.setState({ currentPage: this.state.currentPage + 1 }, () => {
                this.props.onPageChange(this.state.currentPage);
              });
            }}
          >
            <FontAwesomeIcon
              icon={faAngleRight}
              style={
                currentPage !== pageCount
                  ? styles.enabledIcon
                  : styles.disabledIcon
              }
            />
          </button>
        </div>
      </React.Fragment>
    );
  }
}
