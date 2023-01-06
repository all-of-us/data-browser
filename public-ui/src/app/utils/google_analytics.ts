import { environment } from "environments/environment";

declare let gtag: Function;

export function initializeAnalytics() {
  gtag("js", new Date());
  gtag("config", environment.gaId);
}

export function triggerEvent(
  eventName: string,
  eventCategory: string,
  eventAction: string,
  eventLabel: string,
  searchTerm: string,
  _tooltipAction: string
) {
  if (window.gtag) {
    gtag("event", eventName, {
      event_category: "Data Browser " + eventCategory,
      event_action: eventAction,
      event_label: searchTerm,
    });
  } else {
    console.error("Google Analytics gtag.js has not been loaded");
  }
}
