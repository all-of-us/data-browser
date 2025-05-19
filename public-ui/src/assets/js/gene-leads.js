function waitForElm(selector) {
  return new Promise(resolve => {
    function startObserving() {
      const targetNode = document.body;
      if (!targetNode) {
        // Wait until document.body is available
        return requestAnimationFrame(startObserving);
      }

      const found = document.querySelector(selector);
      if (found) {
        return resolve(found);
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(targetNode, {
        childList: true,
        subtree: true
      });
    }

    startObserving();
  });
}

async function loadGeneLeads() {
  await window.ideogram.plotRelatedGenes('LDLR');

  // Center position of ideogram below search input
  const innerWrap = document.querySelector('#_ideogramInnerWrap');
  const ideogramEl = document.querySelector('#_ideogram');
  const gear = document.querySelector('#gear');
  const legend = document.querySelector('#_ideogramLegend');

  if (innerWrap) innerWrap.style.maxWidth = '1057px';
  if (ideogramEl) ideogramEl.style.left = '-35px';
  if (gear) gear.style.right = '310px';
  if (legend) legend.style.left = '808px';
}

function onClickAnnot(annot) {
  window.ideogram.plotRelatedGenes(annot.name);
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

  const div = `
    <div style="height: 120px; width: 100%">
      <div id="ideogram-container" style="height: 120px; width: 100%"></div>
      ${style}
    </div>
  `;

  searchContainer.insertAdjacentHTML('afterBegin', div);

  const config = {
    organism: 'homo-sapiens',
    onLoad: loadGeneLeads,
    container: '#ideogram-container',
    onClickAnnot,
    relatedGenesMode: 'related',
    chrFillColor: { arm: '#DDD', centromere: '#DDF' }
  };

  setTimeout(() => {
    window.ideogram = window.Ideogram.initRelatedGenes(config, 'all');
  }, 0);
});
