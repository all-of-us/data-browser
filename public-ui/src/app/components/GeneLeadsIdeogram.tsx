import * as React from "react";
import { reactStyles } from "app/utils";

declare global {
  interface Window {
    Ideogram: any;
    ideogram: any;
  }
}

const styles = reactStyles({
  container: {
    height: "14em",
    width: "100%",
    background: "white",
    border: "1px solid #dcdcdc",
    borderRadius: "6px",
    padding: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginTop: "1em",
  },
  ideogram: {
    height: "100%",
    width: "100%",
  },
  spinner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "14em",
    fontSize: "1.2em",
    color: "#555",
    fontFamily: "Arial, sans-serif",
  },
});

const styleCss = `
  #_ideogramLegend {
    font: 0.8em;
    font-family: GothamBook, Arial, sans-serif;
  }
  #_ideogramTooltip a {
    color: #0366d6;
    text-decoration: underline;
  }
`;

interface Props {
  gene: string;
}

interface State {
  isLoading: boolean;
}

export class GeneLeadsIdeogram extends React.Component<Props, State> {
  private containerRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    this.initIdeogram(this.props.gene);
  }

componentDidUpdate(prevProps: Props, prevState: State) {
  const { gene } = this.props;

  // Log when isLoading changes
  if (prevState.isLoading !== this.state.isLoading) {
    console.log("isLoading changed:", this.state.isLoading);
  }

  if (prevProps.gene !== gene && typeof window.ideogram?.plotRelatedGenes === 'function') {
        const container = document.getElementById("gene-leads-ideogram-container");

        this.setState({ isLoading: true });

        if (container) {
          container.style.display = "block"; // reset ideogram visibility
        }

    Promise.resolve()
      .then(() => window.ideogram.plotRelatedGenes(gene))
      .then((result: any) => {
        this.setState({ isLoading: false });
        console.log(`plotRelatedGenes result for "${gene}":`);
      })
      .catch((err: any) => {
        console.warn(`Exception: Gene "${gene}" not found in Homo sapiens`, err);
        this.setState({ isLoading: false });
          const container = document.getElementById("gene-leads-ideogram-container");
          if (container) {
            container.style.display = "none";
          }
      });
  }
}


  initIdeogram(gene: string) {
    if (!window.Ideogram || !this.containerRef.current) return;

    const taxon = "Homo sapiens";
    const genesInScope = "all";
    const showAdvanced = ["Homo sapiens", "Mus musculus"].includes(taxon);

    const config = {
      container: `#${this.containerRef.current.id}`,
      organism: taxon,
      chrWidth: 9,
      chrHeight: 150,
      chrLabelSize: 12,
      annotationHeight: 7,
      showVariantInTooltip: false,
      showGeneStructureInTooltip: showAdvanced,
      showProteinInTooltip: showAdvanced,
      showParalogNeighborhoods: showAdvanced,

    onClickAnnot: (annot: any) => {
      Promise.resolve()
        .then(() => {
          console.log(`Clicked gene "${annot.name}"`);
          return window.ideogram.plotRelatedGenes(annot.name);
        })
        .catch((err: any) => {
          console.warn(`Click error for "${annot.name}":`, err);
        });
    },

    onLoad: () => {
      if (!window.ideogram?.chromosomesArray?.length) return;

      this.setState({ isLoading: true });

      const container = document.getElementById("gene-leads-ideogram-container");
      if (container) {
        container.style.display = "block"; // reset ideogram visibility
      }

      Promise.resolve()
        .then(() => {
          const result = window.ideogram.plotRelatedGenes(gene);
          this.setState({ isLoading: false });
          console.log(`onLoad plotting for "${gene}":`, result);
          return result;
        })
        .catch((err: any) => {
          console.warn(`onLoad error for "${gene}":`, err);
          this.setState({ isLoading: false });
          const container = document.getElementById("gene-leads-ideogram-container");
          if (container) {
            container.style.display = "none";
          }
        });

      const wrap = document.getElementById("_ideogramOuterWrap");
      if (wrap) {
        wrap.style.height = "150px";
      }
    },
    };

    window.ideogram = window.Ideogram.initRelatedGenes(config, genesInScope);
  }

render() {
  const { isLoading } = this.state;

  return (
    <>
      <style>{styleCss}</style>
      {isLoading && (
        <div style={styles.spinner}>Loading gene ideogram...</div>
      )}
      <div
        id="gene-leads-ideogram-container"
        className="related-genes-container"
        style={{ ...styles.container, display: isLoading ? "none" : "block" }}
      >
        <div
          id="ideogram-container"
          ref={this.containerRef}
          style={styles.ideogram}
        />
      </div>
    </>
  );
}
}
