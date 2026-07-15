import * as React from "react";

import { reactStyles } from "app/utils";

declare global {
  interface Window {
    Ideogram: any;
    ideogram: any;
  }
}

// Poll for an element Ideogram.js creates. Bounded — an earlier version polled
// forever, so a collapsed/unmounted ideogram left a timer running for the life of
// the page.
function waitForElement(id: string, timeoutMs = 5000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
      const el = document.getElementById(id);
      if (el) {
        return resolve(el);
      }
      if (Date.now() > deadline) {
        return reject(new Error(`Timed out waiting for #${id}`));
      }
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

// Chromosome fill comes from the chrFillColor config option (as in the reference)
// rather than an !important CSS override on .chromosome.
const styleCss = `
  #_ideogram {
      display: flex;
      position: relative;
  }
  #ideogram-container {
    width: 100%;
    overflow-x: auto;
  }
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
  private unmounted = false;
  private loadTimeout: any = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  // Every async path here can resolve after the user has collapsed the section.
  // Route all state updates through this.
  safeSetState(partial: Partial<State>) {
    if (this.unmounted) {
      return;
    }
    this.setState(partial as State);
  }

  async adjustIdeogramLayout() {
    try {
      const wrap = await waitForElement("_ideogramOuterWrap");
      const innerWrap = await waitForElement("_ideogramInnerWrap");
      const ideogram = await waitForElement("_ideogram");
      const legend = await waitForElement("_ideogramLegend");
      const gear = await waitForElement("gear");

      if (this.unmounted) {
        return;
      }

      const screenWidth = window.innerWidth;
      wrap.style.maxWidth = "100%";
      ideogram.style.position = "relative";
      innerWrap.style.removeProperty("overflow");

      // Responsive adjustments based on screen width
      if (screenWidth < 576) {
        // Extra small (mobile)
        ideogram.style.left = "-10%";
        legend.style.left = "60%";
        gear.style.right = "5%";
        gear.style.top = "5%";
      } else if (screenWidth < 768) {
        // Small (mobile landscape, small tablets)
        ideogram.style.left = "-12%";
        legend.style.left = "65%";
        gear.style.right = "8%";
        gear.style.top = "6%";
      } else if (screenWidth < 992) {
        // Medium tablets
        ideogram.style.left = "-13%";
        legend.style.left = "70%";
        gear.style.right = "12%";
        gear.style.top = "7%";
      } else if (screenWidth < 1200) {
        // Laptops
        ideogram.style.left = "-14%";
        legend.style.left = "68%";
        gear.style.right = "20%";
        gear.style.top = "8%";
      } else if (screenWidth < 2000) {
        // Desktops
        ideogram.style.left = "-14%";
        legend.style.left = "78%";
        gear.style.right = "25%";
        gear.style.top = "8%";
      } else {
        // Extra large screens (e.g., 2560px width and above)
        ideogram.style.left = "-16%";
        legend.style.left = "78%";
        gear.style.right = "29%";
        gear.style.top = "8%";
      }
    } catch (error) {
      console.error("Error adjusting layout: ", error);
    } finally {
      this.safeSetState({ isLoading: false });
    }
  }

  componentDidMount() {
    this.initIdeogram(this.props.gene);
  }

  // Ideogram.js manages its own DOM and attaches nodes (tooltip, gear) outside
  // this component's subtree, plus a window.ideogram global. React unmounting the
  // wrapper does not clean any of that up, so collapsing the section would
  // otherwise leave the library's leftovers on the page.
  componentWillUnmount() {
    this.unmounted = true;

    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }

    try {
      const container = this.containerRef.current;
      ["_ideogramTooltip", "gear", "_ideogramOuterWrap"].forEach((id) => {
        const el = document.getElementById(id);
        // Anything still inside our own container is removed by React. Only
        // strip nodes the library parked elsewhere in the document.
        if (el && (!container || !container.contains(el))) {
          el.remove();
        }
      });
    } catch (err) {
      console.warn("Error tearing down ideogram:", err);
    }

    window.ideogram = null;
  }

  componentDidUpdate(prevProps: Props) {
    const { gene } = this.props;

    if (
      prevProps.gene !== gene &&
      typeof window.ideogram?.plotRelatedGenes === "function"
    ) {
      this.safeSetState({ isLoading: true });

      const container = document.getElementById(
        "gene-leads-ideogram-container"
      );
      if (container) {
        container.style.display = "block";
      }

      // Timeout fallback: stop loading if nothing happens in 5s
      this.loadTimeout = setTimeout(() => {
        console.warn(`Timed out loading ideogram for "${gene}"`);
        this.safeSetState({ isLoading: false });
      }, 5000);

      Promise.resolve()
        .then(async () => {
          await window.ideogram.plotRelatedGenes(gene);
          if (this.unmounted) {
            return;
          }
          await this.adjustIdeogramLayout();
        })
        .catch((err) => {
          console.warn(`Exception: Gene "${gene}" not found`, err);
          this.safeSetState({ isLoading: false });
          const errContainer = document.getElementById(
            "gene-leads-ideogram-container"
          );
          if (errContainer) {
            errContainer.style.display = "none";
          }
        })
        .finally(() => {
          this.safeSetState({ isLoading: false });
        });
    }
  }

  initIdeogram(gene: string) {
    if (!window.Ideogram || !this.containerRef.current) {
      return;
    }

    const genesInScope = "all";

    // Config copied from the resolved config of the working Gene Leads demo
    // (eweitz.github.io/ideogram/gene-leads?q=ATM), which labels ~16 of 26
    // related genes where ours labeled 10.
    //
    // The two keys that matter are `rotatable` + `orientation: "vertical"`.
    // Its labels render as rotate(-90) <text> with a `_ideogramLabelRect` hit box;
    // rotated labels need far less horizontal room, so the library's collision
    // detection culls far fewer of them. Ours drew horizontal labels, which
    // collide and get dropped.
    //
    // Note its chrHeight is 100 — SHORTER than the 150 we were using. Vertical
    // space was never the problem.
    const config = {
      container: `#${this.containerRef.current.id}`,
      organism: "homo-sapiens",
      relatedGenesMode: "hints",
      rotatable: true,
      orientation: "vertical",
      chrWidth: 9,
      chrHeight: 100,
      chrLabelSize: 12,
      annotationHeight: 7,
      showAnnotLabels: true,
      chrFillColor: { arm: "#DDD", centromere: "#DDF" },
      showVariantInTooltip: false,
      showGeneStructureInTooltip: true,
      showProteinInTooltip: true,
      showAnnotTooltip: true,

      onClickAnnot: async (annot: any) => {
        if (this.unmounted) {
          return;
        }
        try {
          await window.ideogram.plotRelatedGenes(annot.name);
          if (this.unmounted) {
            return;
          }
          await this.adjustIdeogramLayout();
        } catch (err) {
          console.warn(`Click error for "${annot.name}":`, err);
        }
      },

      onLoad: async () => {
        if (this.unmounted || !window.ideogram?.chromosomesArray?.length) {
          return;
        }

        this.safeSetState({ isLoading: true });

        const container = document.getElementById(
          "gene-leads-ideogram-container"
        );
        if (container) {
          container.style.display = "block";
        }

        try {
          await window.ideogram.plotRelatedGenes(gene);
          if (this.unmounted) {
            return;
          }
          await this.adjustIdeogramLayout();
        } catch (err) {
          console.warn(`onLoad error for "${gene}":`, err);
          this.safeSetState({ isLoading: false });
          const errContainer = document.getElementById(
            "gene-leads-ideogram-container"
          );
          if (errContainer) {
            errContainer.style.display = "none";
          }
        } finally {
          this.safeSetState({ isLoading: false });
        }
      },
    };

    try {
      window.ideogram = window.Ideogram.initRelatedGenes(config, genesInScope);
    } catch (err) {
      console.error("Failed to initialize ideogram:", err);
      const container = document.getElementById(
        "gene-leads-ideogram-container"
      );
      if (container) {
        container.style.display = "none";
      }
      this.safeSetState({ isLoading: false });
    }
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