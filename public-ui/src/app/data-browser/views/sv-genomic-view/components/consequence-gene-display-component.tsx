import * as React from "react";
import { ClrIcon } from "app/utils/clr-icon";

interface ConsequenceProps {
  consequenceString: string;
}

interface ConsequenceState {
  showAll: boolean;
}

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
      return <div>-</div>;
    }

    // Parse the consequence string into a map
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

    // Limit the first entry genes to 45 characters
    let truncatedGeneStr = "";
    let shouldTruncate = false;

    if (firstEntry) {
      let tempStr = "";
      for (let i = 0; i < firstEntry[1].length; i++) {
        const nextGene = (i === 0 ? "" : ", ") + firstEntry[1][i];
        if (tempStr.length + nextGene.length > 45) {
          shouldTruncate = true;
          break;
        }
        tempStr += nextGene;
      }
      truncatedGeneStr = shouldTruncate ? tempStr + " ..." : tempStr;
    }

    return (
      <div>
        <span style={{ fontWeight: "bold" }}>
          Consequence(s) + associated gene(s):
        </span>
        <br />
        <div style={{ whiteSpace: "pre-line", marginTop: "4px" }}>
          {firstEntry && (
            <div style={{ marginBottom: "0.5em" }}>
              <i>{firstEntry[0]}:</i>{" "}
              {showAll ? firstEntry[1].join(", ") : truncatedGeneStr}
            </div>
          )}

          {showAll &&
            restEntries.map(([label, genes], idx) => (
              <div key={idx} style={{ marginBottom: "0.5em" }}>
                <i>{label}:</i> {genes.join(", ")}
              </div>
            ))}
        </div>

        {consequenceEntries.length > 1 && (
          <button
            type="button"
            onClick={this.toggleShowAll}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: "#007bff",
              cursor: "pointer",
              fontSize: "13px",
              display: "inline-block",
              marginTop: "4px",
            }}
          >
            {showAll ? "Show less" : (
              <>
                <ClrIcon shape="ellipsis-horizontal" style={{ color: "#2691D0" }} /> Show More
              </>
            )}
          </button>
        )}
      </div>
    );
  }
}
