import { environment } from 'environments/environment';

declare let gtag: Function;

export function initializeAnalytics() {
  gtag('js', new Date());
  gtag('config', environment.gaId);
}

export function triggerEvent(
  eventName: string, eventCategory: string, eventAction: string,
        eventLabel: string, searchTerm: string, tooltipAction: string) {
  if (window['gtag']) {
    gtag('event', eventName, {
      'category': 'Data Browser ' + eventCategory,
      'action': eventAction,
      'label': eventLabel,
      'landingSearchTerm': searchTerm,
      'tooltipsHoverAction': tooltipAction
    });
  } else {
    console.error('Google Analytics gtag.js has not been loaded');
  }
}

