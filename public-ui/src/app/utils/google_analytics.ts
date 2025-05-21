export function initializeAnalytics() {
  // GTM handles initialization; nothing required here
  console.info("GTM initialized via HTML tag");
}

export function triggerEvent(
  eventName: string,
  eventCategory: string,
  eventAction: string,
  eventLabel: string,
  searchTerm: string,
  tooltipAction: string
) {
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      eventCategory: `Data Browser ${eventCategory}`,
      eventAction: eventAction,
      eventLabel: eventLabel,
      searchTerm: searchTerm,
      tooltipAction: tooltipAction
    });
  } else {
    console.error("dataLayer is not available");
  }
}
