import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Ideogram: any;
    ideogram: any;
  }
}

interface Props {
  geneName: string;
}

export const GeneIdeogram: React.FC<Props> = ({ geneName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

  // Reset error when geneName changes
  useEffect(() => {
    setHasError(false);
  }, [geneName]);

  const restyleIdeogram = () => {
    const wrap = document.querySelector('#_ideogramInnerWrap') as HTMLElement;
    const ideogram = document.querySelector('#_ideogram') as HTMLElement;
    const gear = document.querySelector('#gear') as HTMLElement;
    const legend = document.querySelector('#_ideogramLegend') as HTMLElement;

    if (wrap) wrap.style.maxWidth = '1057px';
    if (ideogram) ideogram.style.left = '-35px';
    if (gear) gear.style.right = '310px';
    if (legend) legend.style.left = '808px';
  };

  useEffect(() => {
    mountedRef.current = true;

    if (!window.Ideogram || !geneName || !containerRef.current) return;

    const config = {
      organism: 'homo-sapiens',
      container: `#${containerRef.current.id}`,
      relatedGenesMode: 'related',
      onClickAnnot: (annot) => {
        try {
          window.ideogram.plotRelatedGenes(annot.name);
          setTimeout(() => {
            if (mountedRef.current) restyleIdeogram();
          }, 100);
        } catch (err) {
          console.error('Error in onClickAnnot:', err);
          if (mountedRef.current) setHasError(true);
        }
      },
      onLoad: async () => {
        try {
          await Promise.resolve(window.ideogram.plotRelatedGenes(geneName));
          setTimeout(() => {
            if (mountedRef.current) restyleIdeogram();
          }, 100);
        } catch (err) {
          console.error(`Could not plot gene "${geneName}":`, err);
          if (mountedRef.current) setHasError(true);
        }
      },
      chrFillColor: { arm: '#DDD', centromere: '#DDF' },
    };

    try {
      window.ideogram = window.Ideogram.initRelatedGenes(config, 'all');
    } catch (err) {
      console.error('Error initializing ideogram:', err);
      if (mountedRef.current) setHasError(true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [geneName]);

  if (hasError) return null;

  return (
    <div style={{ height: '120px', width: '100%' }}>
      <div
        id="ideogram-container"
        ref={containerRef}
        style={{ height: '120px', width: '100%' }}
      />
      <style>
        {`
          #_ideogramLegend {
            font: 0.8em;
            font-family: GothamBook, Arial, sans-serif;
          }
          #_ideogramTooltip a {
            color: #0366d6;
          }
        `}
      </style>
    </div>
  );
};
