import * as React from "react";
import { ClrIcon } from "app/utils/clr-icon";

interface ConsequenceProps {
  consequenceString: string;
}

interface ConsequenceState {
  showAll: boolean;
}

const css = `
  .consequence-wrapper {
    font-family: gothamBook, Arial, Helvetica, sans-serif;
  }

  .consequence-heading {
    font-family: gothamBold, Arial, Helvetica, sans-serif;
  }

  .consequence-item {
    margin-bottom: 0.5em;
  }

  .consequence-toggle {
    background: none;
    border: none;
    padding: 0;
    color: #007bff;
    cursor: pointer;
    font-size: 13px;
    display: inline;
    margin-left: 6px;
  }
`;

export class ConsequenceGeneDisplay extends React.Component<ConsequenceProps, ConsequenceState> {
  constructor(props: ConsequenceProps) {
    super(props);
    this.state = {
      showAll: false,
    };
  }

  toggleShowAll = () => {
    this.setState((prev) => ({ showAll: !prev.showAll }));
  };

render() {
  const { consequenceString } = this.props;
  const { showAll } = this.state;

  if (consequenceString === "-" || !consequenceString.trim()) {
    return <div className="consequence-wrapper">-</div>;
  }

  const consequenceMap: Record<string, string[]> = {};
  consequenceString.split(";").forEach((line) => {
    const [label, geneStr] = line.split(" - ");
    if (label && geneStr) {
      consequenceMap[label.trim()] = geneStr.split(",").map((g) => g.trim());
    }
  });

  const consequenceEntries = Object.entries(consequenceMap);
  const firstEntry = consequenceEntries[0];
  const restEntries = consequenceEntries.slice(1);

  let truncatedGeneStr = "";
  let shouldTruncate = false;

  if (firstEntry) {
    let tempStr = "";
    for (let i = 0; i < firstEntry[1].length; i++) {
      const nextGene = (i === 0 ? "" : ", ") + firstEntry[1][i];
      if (tempStr.length + nextGene.length > 50) {
        shouldTruncate = true;
        break;
      }
      tempStr += nextGene;
    }
    truncatedGeneStr = shouldTruncate ? tempStr.trim() : tempStr;
  }

  return (
    <div className="consequence-wrapper">
      <style>{css}</style>

      <span className="consequence-heading">Predicted Consequence(s):</span>
      <br />
      <div style={{ whiteSpace: "pre-line", marginTop: "4px" }}>
        {firstEntry && (
          <div className="consequence-item">
            <i>{firstEntry[0]}:</i>{" "}
            <span style={{ display: "inline" }}>
              {showAll ? firstEntry[1].join(", ") : truncatedGeneStr}
              {!showAll && (shouldTruncate || consequenceEntries.length > 1) && (
                <button
                  type="button"
                  onClick={this.toggleShowAll}
                  className="consequence-toggle"
                >
                  <ClrIcon shape="ellipsis-horizontal" style={{ color: "#2691D0" }} /> Show more
                </button>
              )}
            </span>
          </div>
        )}

        {showAll &&
          restEntries.map(([label, genes], idx) => (
            <div key={idx} className="consequence-item">
              <i>{label}:</i> {genes.join(", ")}
            </div>
          ))}

        {showAll && (shouldTruncate || consequenceEntries.length > 1) && (
          <div style={{ marginTop: "4px" }}>
            <button
              type="button"
              onClick={this.toggleShowAll}
              className="consequence-toggle"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
}
