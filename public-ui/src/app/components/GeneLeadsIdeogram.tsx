import * as React from "react";
import { reactStyles } from "app/utils";

declare global {
  interface Window {
    Ideogram: any;
    ideogram: any;
  }
}

function waitForElement(id: string): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const check = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      setTimeout(check, 50);
    };
    check();
  });
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
  #_ideogram {
      min-width: 1150px;
      display: flex;
  }

  #_ideogramInnerWrap {
    max-width: 1057px;
  }

  #ideogram-container {
    width: 100%;
    overflow-x: auto;
  }

  #gear {
    right: 310px !important;
  }

  #_ideogramLegend {
    font: 0.8em;
    font-family: GothamBook, Arial, sans-serif;
    position: relative;
    left: 808px;
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

  async adjustIdeogramLayout() {
    try {
      const wrap = await waitForElement("_ideogramOuterWrap");
      const ideogram = await waitForElement("_ideogram");
      const legend = await waitForElement("_ideogramLegend");
      const gear = await waitForElement("gear");
      const screenWidth = window.innerWidth;

      wrap.style.maxWidth = "1200px";
      ideogram.style.position = "relative";


      if (screenWidth < 768) {
        ideogram.style.left = "-20px";
        gear.style.right = "20px";
        legend.style.left = "300px";
      } else if (screenWidth < 1024) {
        ideogram.style.left = "-60px";
        gear.style.right = "40px";
        legend.style.left = "500px";
      } else if (screenWidth <= 1212) {
          // Narrow desktop or small laptop
          ideogram.style.left = "-80px";
          gear.style.right = "45px";
          legend.style.left = "680px";
      } else {
        ideogram.style.left = "-95px";
        gear.style.right = "50px";
        legend.style.left = "738px";
      }
    } catch (error) {
      console.error("Error adjusting layout: ", error);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  componentDidMount() {
    this.initIdeogram(this.props.gene);
  }

    componentDidUpdate(prevProps: Props) {
      const { gene } = this.props;

      if (
        prevProps.gene !== gene &&
        typeof window.ideogram?.plotRelatedGenes === "function"
      ) {
        this.setState({ isLoading: true });

        const container = document.getElementById("gene-leads-ideogram-container");
        if (container) container.style.display = "block";

        Promise.resolve()
          .then(async () => {
            await window.ideogram.plotRelatedGenes(gene);
            await this.adjustIdeogramLayout();

            const wrap = document.getElementById("_ideogramOuterWrap");
            if (wrap) wrap.style.height = "150px";
          })
          .catch((err) => {
            console.warn(`Exception: Gene "${gene}" not found`, err);
            const container = document.getElementById("gene-leads-ideogram-container");
            if (container) container.style.display = "none";
          })
          .finally(() => {
            this.setState({ isLoading: false });
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
      chromosomes: [
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
        "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y"
      ],
      organism: taxon,
      chrWidth: 9,
      chrHeight: 150,
      chrLabelSize: 12,
      annotationHeight: 7,
      showVariantInTooltip: false,
      showGeneStructureInTooltip: true,
      showProteinInTooltip: true,
      showParalogNeighborhoods: true,
      showAnnotTooltip: true,

      onClickAnnot: (annot: any) => {
        window.ideogram.plotRelatedGenes(annot.name).catch((err: any) => {
          console.warn(`Click error for "${annot.name}":`, err);
        });
      },

      onLoad: async () => {
        if (!window.ideogram?.chromosomesArray?.length) return;

        this.setState({ isLoading: true });

        const container = document.getElementById("gene-leads-ideogram-container");
        if (container) container.style.display = "block";

        try {
          await window.ideogram.plotRelatedGenes(gene);
          await this.adjustIdeogramLayout();
        } catch (err) {
          console.warn(`onLoad error for "${gene}":`, err);
          this.setState({ isLoading: false });
          const container = document.getElementById("gene-leads-ideogram-container");
          if (container) container.style.display = "none";
        } finally {
            this.setState({ isLoading: false });
        }

        const wrap = document.getElementById("_ideogramOuterWrap");
        if (wrap) wrap.style.height = "150px";
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
