function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      const elm = document.querySelector(selector);
      if (elm) {
        observer.disconnect();
        resolve(elm);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

async function loadGeneLeads() {
  try {
    const selected = window.ideogram;
    if (!selected || selected.length === 0) {
      // Default fallback gene
      await window.ideogram.plotRelatedGenes('LDLR');
    }

    const innerWrap = document.querySelector('#_ideogramInnerWrap');
    const ideogramEl = document.querySelector('#_ideogram');
    const gear = document.querySelector('#gear');
    const legend = document.querySelector('#_ideogramLegend');

    if (innerWrap) innerWrap.style.maxWidth = '1057px';
    if (ideogramEl) ideogramEl.style.left = '-35px';
    if (gear) gear.style.right = '310px';
    if (legend) legend.style.left = '808px';
  } catch (err) {
    console.error("Error loading gene leads:", err);
    const container = document.querySelector('#ideogram-container');
    if (container) container.remove(); // Remove on failure
  }
}

waitForElm('.search-container').then((searchContainer) => {
  const style = `
    <style>
      #_ideogramLegend {
        font: 0.8em;
        font-family: GothamBook, Arial, sans-serif;
      }
      #_ideogramTooltip a {
        color: #0366d6;
      }
    </style>
  `;

  const ideogramHTML = `
    <div style="height: 120px; width: 100%">
      <div id="ideogram-container" style="height: 120px; width: 100%"></div>
      ${style}
    </div>
  `;

  searchContainer.insertAdjacentHTML('afterBegin', ideogramHTML);

  const config = {
    organism: 'homo-sapiens',
    onLoad: loadGeneLeads,
    container: '#ideogram-container',
    onClickAnnot,
    relatedGenesMode: 'related',
    chrFillColor: { arm: '#DDD', centromere: '#DDF' }
  };

  try {
    window.ideogram = Ideogram.initRelatedGenes(config, 'all');
  } catch (err) {
    console.error("Failed to initialize ideogram:", err);
    const container = document.querySelector('#ideogram-container');
    if (container) container.remove(); // Remove on failure
  }
});

function onClickAnnot(annot) {
  try {
    ideogram.plotRelatedGenes(annot.name);
  } catch (err) {
    console.warn(`Error plotting related gene ${annot.name}:`, err);
  }
}
