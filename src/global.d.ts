// Tell TypeScript that window.ReactNativeWebView exists
interface Window {
  ReactNativeWebView?: {
    postMessage: (message: string) => void;
  };
  onYouTubeIframeAPIReady: () => void;
}
