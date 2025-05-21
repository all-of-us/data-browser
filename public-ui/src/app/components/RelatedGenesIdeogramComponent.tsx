import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Ideogram: any;
    ideogram: any;
  }
}

interface Props {
  gene: string;
}

export const RelatedGenesIdeogramComponent: React.FC<Props> = ({ gene }) => {
  const ideogramRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  const taxon = 'Homo sapiens';
  const genesInScope: 'all' = 'all';
  const speciesList = ['Homo sapiens'];

  const queryFn = (genes: string[]) => {
    console.log('Querying gene:', genes);
  };

  const verticalPad = 40;
  const showAdvanced = ['Homo sapiens', 'Mus musculus'].includes(taxon);

  const restyleIdeogram = () => {
    const wrap = document.querySelector('#_ideogramInnerWrap') as HTMLElement | null;
    const ideogram = document.querySelector('#_ideogram') as HTMLElement | null;
    const gear = document.querySelector('#gear') as HTMLElement | null;

    if (wrap) wrap.style.maxWidth = '1057px';
    if (ideogram) ideogram.style.left = '-35px';
    if (gear) gear.style.right = '310px';
  };

  const genomeHasChromosomes = () =>
    window.ideogram?.chromosomesArray?.length > 0;

  const onClickAnnot = (annot: any) => {
    try {
      window.ideogram.plotRelatedGenes(annot.name);
      queryFn([annot.name]);
      setTimeout(restyleIdeogram, 100);
    } catch (e) {
      console.error('onClickAnnot failed', e);
      setError(true);
    }
  };

  const onPlotRelatedGenes = () => {};

  const onWillShowAnnotTooltip = async (annot: any) => {
    return annot instanceof Promise ? await annot : annot;
  };

  const onDidShowAnnotTooltip = () => {
    const hoveredGene = document.querySelector('#ideo-related-gene')?.textContent;
    const ideoTissuePlotTitle = document.querySelector('._ideoTissuePlotTitle');
    if (hoveredGene && ideoTissuePlotTitle) {
      const gtexUrl = `https://www.gtexportal.org/home/gene/${hoveredGene}`;
      const gtexLink = `<a href="${gtexUrl}" class="_ideoTitleGtexLink" target="blank">GTEx</a>`;
      ideoTissuePlotTitle.innerHTML = `Reference expression by tissue, per ${gtexLink}`;
    }
  };

  useEffect(() => {
    if (!window.Ideogram || !gene || !ideogramRef.current) return;

    try {
      const config = {
        container: `#${ideogramRef.current.id}`,
        organism: taxon,
        chrWidth: 9,
        chrHeight: 150 - verticalPad,
        chrLabelSize: 14,
        annotationHeight: 10,
        onClickAnnot,
        onPlotRelatedGenes,
        onWillShowAnnotTooltip,
        onDidShowAnnotTooltip,
        showVariantInTooltip: false,
        showGeneStructureInTooltip: showAdvanced,
        showProteinInTooltip: showAdvanced,
        showParalogNeighborhoods: showAdvanced,
        onLoad() {
          if (!genomeHasChromosomes()) return;
          this.plotRelatedGenes(gene);
          restyleIdeogram();

          // Move legend into a fixed container
          setTimeout(() => {
            const legend = document.getElementById('_ideogramLegend');
            const customLegend = document.getElementById('custom-legend-container');
            if (legend && customLegend && !customLegend.contains(legend)) {
              customLegend.appendChild(legend);
              Object.assign(legend.style, {
                position: 'relative',
                margin: '0 auto',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                fontSize: '0.8em',
                fontFamily: 'GothamBook, Arial, sans-serif',
                maxWidth: '230px',
              });
            }
          }, 100);
        }
      };

      const ideo = window.Ideogram.initRelatedGenes(config, genesInScope);
      window.ideogram = ideo;
      window.ideogram.SCP = { queryFn, speciesList };

    } catch (e) {
      console.error('Ideogram init failed:', e);
      setError(true);
    }
  }, [gene]);

  if (error) return null;

  return (
    <div
      className="related-genes-container"
      style={{
        width: '100%',
        background: 'white',
        border: '1px solid #dcdcdc',
        borderRadius: '6px',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          id="related-genes-ideogram-container"
          ref={ideogramRef}
          style={{
            height: '140px',
            width: '100%',
            overflowX: 'auto',
            overflowY: 'visible',
            position: 'relative',
          }}
        />
        <div
          id="custom-legend-container"
          style={{ flexShrink: 0, minWidth: '230px' }}
        />
      </div>
      <style>
        {`
          #_ideogramTooltip a {
            color: #0366d6;
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};
