export {};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    setPublicApiUrl: (...args: any[]) => void;
    dataLayer: any;
  }
}
