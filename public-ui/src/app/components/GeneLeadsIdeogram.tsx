import * as React from "react";
import { CSSProperties } from "react";

const styles: { [key: string]: CSSProperties } = {
  container: {
    width: '100%',
    backgroundColor: 'white',
    border: '1px solid #dcdcdc',
    borderRadius: '6px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
  },
  row: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap', // ✅ Fixed
  },
  ideogram: {
    flex: '1 1 auto',
    height: '140px',
    minWidth: '300px',
    position: 'relative', // ✅ Fixed
  },
  legend: {
    flexShrink: 0,
    minWidth: '230px',
  }
};

const css = `
  #_ideogramLegend {
    font: 0.8em;
    font-family: GothamBook, Arial, sans-serif;
    background: white;
    padding: 0.5rem;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    max-width: 230px;
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
  loaded: boolean;
  error: boolean;
}

export class GeneLeadsIdeogram extends React.Component<Props, State> {
  private ideogram: any;
  private containerRef = React.createRef<HTMLDivElement>();
  private legendRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
      error: false
    };
  }

  componentDidMount() {
    this.initIdeogram();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.gene !== this.props.gene) {
      this.setState({ loaded: false }, () => {
        this.plotGene(this.props.gene);
      });
    }
  }

  async waitForElm(selector: string): Promise<Element> {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  plotGene(gene: string) {
    try {
      if (window.ideogram?.plotRelatedGenes) {
        window.ideogram.plotRelatedGenes(gene);
        this.relocateLegend();
        this.setState({ loaded: true });
      }
    } catch (e) {
      console.error("Error plotting gene:", e);
      this.setState({ error: true });
    }
  }

  relocateLegend() {
    const legend = document.getElementById('_ideogramLegend');
    const legendContainer = this.legendRef.current;
    if (legend && legendContainer && !legendContainer.contains(legend)) {
      legendContainer.innerHTML = '';
      legendContainer.appendChild(legend);
    }
  }

  async initIdeogram() {
    await this.waitForElm('.search-container');

    if (!window.Ideogram || !this.containerRef.current) return;

    const config = {
      organism: 'homo-sapiens',
      container: `#${this.containerRef.current.id}`,
      relatedGenesMode: 'related',
      onClickAnnot: (annot: any) => {
        window.ideogram.plotRelatedGenes(annot.name);
        this.relocateLegend();
      },
      onLoad: () => {
        this.plotGene(this.props.gene);
      },
      chrFillColor: { arm: '#DDD', centromere: '#DDF' }
    };

    setTimeout(() => {
      window.ideogram = window.Ideogram.initRelatedGenes(config, 'all');
    }, 0);
  }

  render() {
    if (this.state.error) return null;

    return (
      <React.Fragment>
        <style>{css}</style>
        <div style={styles.container}>
          <div style={styles.row}>
            <div
              id="ideogram-container"
              ref={this.containerRef}
              style={styles.ideogram}
            />
            <div ref={this.legendRef} style={styles.legend}></div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
