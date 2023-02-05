import {
  WindowRequestEvent,
  WindowListener,
  Window,
  WindowEthereum,
  WalletProvider,
} from './types';
import AAWindowProvider from './window-provider';

Object.defineProperty(window, 'aa-provider', {
  value: new AAWindowProvider({
    postMessage: (data: WindowRequestEvent) =>
      window.postMessage(data, window.location.origin),
    addEventListener: (fn: WindowListener) =>
      window.addEventListener('message', fn, false),
    removeEventListener: (fn: WindowListener) =>
      window.removeEventListener('message', fn, false),
    origin: window.location.origin,
  }),
  writable: false,
  configurable: false,
});

if (!(window as Window).walletRouter) {
  Object.defineProperty(window, 'walletRouter', {
    value: {
      currentProvider: (window as Window)['aa-provider'],
      lastInjectedProvider: window.ethereum,
      providers: [
        // deduplicate the providers array: https://medium.com/@jakubsynowiec/unique-array-values-in-javascript-7c932682766c
        ...new Set([
          (window as Window)['aa-provider'],
          // eslint-disable-next-line no-nested-ternary
          ...(window.ethereum
            ? // let's use the providers that has already been registered
              // This format is used by coinbase wallet
              Array.isArray(window.ethereum.providers)
              ? [...window.ethereum.providers, window.ethereum]
              : [window.ethereum]
            : []),
          (window as Window)['aa-provider'],
        ]),
      ],
      getProviderInfo(provider: WalletProvider) {
        return (
          provider.providerInfo || {
            label: 'Injected Provider',
            injectedNamespace: 'ethereum',
          }
        );
      },
      setSelectedProvider() {},
      addProvider(newProvider: WalletProvider) {
        if (!this.providers.includes(newProvider)) {
          this.providers.push(newProvider);
        }

        this.lastInjectedProvider = newProvider;
      },
    },
    writable: false,
    configurable: false,
  });
}

let cachedWindowEthereumProxy: WindowEthereum;
let cachedCurrentProvider: WalletProvider;

Object.defineProperty(window, 'ethereum', {
  get() {
    const walletRouter = (window as Window).walletRouter;

    if (!walletRouter) return undefined;

    if (
      cachedWindowEthereumProxy &&
      cachedCurrentProvider === walletRouter.currentProvider
    ) {
      return cachedWindowEthereumProxy;
    }
    cachedWindowEthereumProxy = new Proxy(walletRouter.currentProvider, {
      get(target, prop, receiver) {
        if (
          walletRouter &&
          !(prop in walletRouter.currentProvider) &&
          prop in walletRouter
        ) {
          // Uniswap MM connector checks the providers array for the MM provider and forces to use that
          // https://github.com/Uniswap/web3-react/blob/main/packages/metamask/src/index.ts#L57
          // as a workaround we need to remove this list for uniswap so the actual provider change can work after reload.
          // The same is true for `galaxy.eco`
          if (
            (window.location.href.includes('app.uniswap.org') ||
              window.location.href.includes('kwenta.io') ||
              window.location.href.includes('galxe.com')) &&
            prop === 'providers'
          ) {
            return null;
          }
          // let's publish the api of `window.walletRouter` also on `window.ethereum` for better discoverability

          // @ts-expect-error ts accepts symbols as index only from 4.4
          // https://stackoverflow.com/questions/59118271/using-symbol-as-object-key-type-in-typescript
          return window.walletRouter[prop];
        }

        return Reflect.get(target, prop, receiver);
      },
    });
    cachedCurrentProvider = walletRouter.currentProvider;

    return cachedWindowEthereumProxy;
  },
});
