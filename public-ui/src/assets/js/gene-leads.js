function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.documentElement, {
          childList: true,
          subtree: true
      });
  });
}

async function loadGeneLeads() {
  // Check if a gene is already plotted
  const selected = window.ideogram;

  console.log(selected);

  if (!selected || selected.length === 0) {
    // If no gene is selected, load default gene
    await window.ideogram.plotRelatedGenes('LDLR');
  }

  // Apply layout styling
  const innerWrap = document.querySelector('#_ideogramInnerWrap');
  const ideogramEl = document.querySelector('#_ideogram');
  const gear = document.querySelector('#gear');
  const legend = document.querySelector('#_ideogramLegend');

  if (innerWrap) innerWrap.style.maxWidth = '1057px';
  if (ideogramEl) ideogramEl.style.left = '-35px';
  if (gear) gear.style.right = '310px';
  if (legend) legend.style.left = '808px';
}


waitForElm('.search-container').then((elm) => {
  searchContainer = document.querySelector('.search-container')

  const style =
    '<style>' +
    '#_ideogramLegend { ' +
      'font: 0.8em; ' +
      'font-family: GothamBook, Arial, sans-serif; ' +
    '}' +
    '#_ideogramTooltip a { ' +
      'color: #0366d6; ' +
    '}' +
    '</style>'

  div =
    '<div style="height: 120px; width: 100%">' +
      '<div id="ideogram-container" style="height: 120px; width: 100%"></div>' +
      style +
    '</div>'
  searchContainer.insertAdjacentHTML('afterBegin', div)

  // Ideogram configuration object
  config = {
    organism: 'homo-sapiens',
    onLoad: loadGeneLeads,
    container: '#ideogram-container',
    onClickAnnot,
    relatedGenesMode: 'related',
    chrFillColor: {arm: '#DDD', centromere: '#DDF'}
  }

  setTimeout(() => {
    ideogram = Ideogram.initRelatedGenes(config, 'all')
  }, 0)
});


/** Upon clicking a triangular annotation or tooltip, plot that gene */
function onClickAnnot(annot) {
  ideogram.plotRelatedGenes(annot.name);
}