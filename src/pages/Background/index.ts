import startMain from './main';
/**
 * @metamask/browser-passworder uses window.crypto and since
 * background script is a service worker window is not available anymore.
 * Below is a quick but dirty fix for now.
 */
global.window = {
  crypto: crypto,
};

startMain();
