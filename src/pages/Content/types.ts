import { EIP1193_ERROR_CODES } from './window-provider/eip-1193';

export type WalletProvider = {
  providerInfo?: {
    label: string;
    injectedNamespace: string;
    iconURL: string;
    identityFlag?: string;
    checkIdentity?: () => boolean;
  };
  on: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  removeListener: (
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ) => unknown;
  [optionalProps: string]: unknown;
};

export type WindowEthereum = WalletProvider & {
  isMetaMask?: boolean;
  autoRefreshOnNetworkChange?: boolean;
};

export interface Window {
  'aa-provider'?: {};
  walletRouter?: {
    currentProvider: WalletProvider;
    providers: WalletProvider[];
    shouldSetTallyForCurrentProvider: (
      shouldSetTally: boolean,
      shouldReload?: boolean
    ) => void;
    getProviderInfo: (
      provider: WalletProvider
    ) => WalletProvider['providerInfo'];
    addProvider: (newProvider: WalletProvider) => void;
  };
  ethereum?: WindowEthereum;
  oldEthereum?: WindowEthereum;
}

export type RPCRequest = {
  method: string;
  params: Array<unknown>; // This typing is required by ethers.js but is not EIP-1193 compatible
};

export type WindowRequestEvent = {
  id: string;
  target: unknown;
  request: RPCRequest;
};

export type WindowResponseEvent = {
  origin: string;
  source: unknown;
  data: { id: string; target: string; result: unknown };
};

export type WindowListener = (event: WindowResponseEvent) => void;

export type PortResponseEvent = {
  id: string;
  jsonrpc: '2.0';
  result: unknown;
};

export type EIP1193ErrorPayload =
  | (typeof EIP1193_ERROR_CODES)[keyof typeof EIP1193_ERROR_CODES] & {
      data?: unknown;
    };

export type WindowTransport = {
  postMessage: (data: WindowRequestEvent) => void;
  addEventListener: (listener: WindowListener) => void;
  removeEventListener: (listener: WindowListener) => void;
  origin: string;
};

export type PortListenerFn = (callback: unknown, ...params: unknown[]) => void;
export type PortListener = (listener: PortListenerFn) => void;

export type PortTransport = {
  postMessage: (data: unknown) => void;
  addEventListener: PortListener;
  removeEventListener: PortListener;
  origin: string;
};

export type ProviderTransport = WindowTransport | PortTransport;

export type EthersSendCallback = (error: unknown, response: unknown) => void;

export type AAExtensionConfigPayload = {
  method: 'aa-extension_getConfig';
  chainId?: string;
  shouldReload?: boolean;
  [prop: string]: unknown;
};
