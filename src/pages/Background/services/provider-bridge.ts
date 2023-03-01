import BaseService, { BaseServiceCreateProps } from './base';
import MainServiceManager from './main';
import { EthersTransactionRequest, ServiceLifecycleEvents } from './types';
import browser from 'webextension-polyfill';
import {
  EIP1193ErrorPayload,
  PortResponseEvent,
  RPCRequest,
} from '../../Content/types';
import { AA_EXTENSION_CONFIG, EXTERNAL_PORT_NAME } from '../constants';
import { RootState } from '../redux-slices';
import { isAAExtensionConfigPayload } from '../../Content/window-provider/runtime-type-checks';
import showExtensionPopup, {
  checkPermissionSign,
  checkPermissionSignTransaction,
  parseSigningData,
  toHexChainID,
} from '../utils';
import {
  EIP1193Error,
  EIP1193_ERROR_CODES,
  isEIP1193Error,
} from '../../Content/window-provider/eip-1193';
import { AllowedQueryParamPage } from '../types/chrome-messages';
import { requestPermission } from '../redux-slices/permissions';
import { ethers } from 'ethers';
import { hexlify, toUtf8Bytes } from 'ethers/lib/utils.js';
import { signDataRequest } from '../redux-slices/signing';
import { HexString } from '../types/common';
import { sendTransactionRequest } from '../redux-slices/transactions';

type JsonRpcTransactionRequest = Omit<EthersTransactionRequest, 'gasLimit'> & {
  gas?: string;
  input?: string;
  annotation?: string;
};

export type PermissionRequest = {
  key: string;
  origin: string;
  faviconUrl: string;
  chainID: string;
  title: string;
  state: 'request' | 'allow' | 'deny';
  accountAddress: string;
};

// https://eips.ethereum.org/EIPS/eip-3326
export type SwitchEthereumChainParameter = {
  chainId: string;
};

// https://eips.ethereum.org/EIPS/eip-3085
export type AddEthereumChainParameter = {
  chainId: string;
  blockExplorerUrls?: string[];
  chainName?: string;
  iconUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
};

export type PortRequestEvent = {
  id: string;
  request: RPCRequest;
};

export type PermissionMap = {
  evm: {
    [chainID: string]: {
      [address: string]: {
        [origin: string]: PermissionRequest;
      };
    };
  };
};

type Events = ServiceLifecycleEvents & {
  requestPermission: PermissionRequest;
  initializeAllowedPages: PermissionMap;
  setClaimReferrer: string;
  walletConnectInit: string;
};

type ProviderBridgeServiceProps = {} & BaseServiceCreateProps;

function parsedRPCErrorResponse(error: { body: string }):
  | {
      code: number;
      message: string;
    }
  | undefined {
  try {
    const parsedError = JSON.parse(error.body).error;
    return {
      /**
       * The code should be the same as for user rejected requests because otherwise it will not be displayed.
       */
      code: 4001,
      message:
        'message' in parsedError && parsedError.message
          ? parsedError.message[0].toUpperCase() + parsedError.message.slice(1)
          : EIP1193_ERROR_CODES.userRejectedRequest.message,
    };
  } catch (err) {
    return undefined;
  }
}

export default class ProviderBridgeService extends BaseService<Events> {
  #pendingRequests: {
    [origin: string]: {
      resolve: (value: unknown) => void;
      reject: (value: unknown) => void;
    };
  } = {};

  openPorts: Array<browser.Runtime.Port> = [];

  static create = async ({
    mainServiceManager,
  }: ProviderBridgeServiceProps): Promise<ProviderBridgeService> => {
    if (!mainServiceManager)
      throw new Error(
        'mainServiceManager is needed for Provider Bridge Servie'
      );
    return new this(mainServiceManager);
  };

  _startService = async () => {};

  _stopService = async () => {};

  private constructor(readonly mainServiceManager: MainServiceManager) {
    super();

    browser.runtime.onConnect.addListener(
      async (port: browser.Runtime.Port) => {
        if (port.name === EXTERNAL_PORT_NAME && port.sender?.url) {
          port.onMessage.addListener((event: any) => {
            this.onMessageListener(port, event);
          });
          port.onDisconnect.addListener(() => {
            this.openPorts = this.openPorts.filter(
              (openPort) => openPort !== port
            );
          });
          this.openPorts.push(port);

          // we need to send this info ASAP so it arrives before the webpage is initializing
          // so we can set our provider into the correct state, BEFORE the page has a chance to
          // to cache it, store it etc.
          port.postMessage({
            id: 'aa-extension',
            jsonrpc: '2.0',
            result: {
              method: AA_EXTENSION_CONFIG,
            },
          });
        }
      }
    );
  }

  async onMessageListener(
    port: browser.Runtime.Port,
    event: PortRequestEvent
  ): Promise<void> {
    const { url, tab } = port.sender;
    if (typeof url === 'undefined') {
      return;
    }
    const { origin } = new URL(url);
    const response: PortResponseEvent = {
      id: event.id,
      jsonrpc: '2.0',
      result: [],
    };
    const network = (this.mainServiceManager.store.getState() as RootState)
      .network.activeNetwork;
    const originPermission = await this.checkPermission(origin);
    if (isAAExtensionConfigPayload(event.request)) {
      // let's start with the internal communication
      response.id = 'aa-extension';
      response.result = {
        method: event.request.method,
        chainId: toHexChainID(network.chainID),
      };
    } else if (
      event.request.method === 'eth_chainId' ||
      event.request.method === 'net_version'
    ) {
      response.result = await this.routeSafeRPCRequest(
        event.request.method,
        event.request.params,
        origin
      );
    } else if (typeof originPermission !== 'undefined') {
      //   // if it's not internal but dapp has permission to communicate we proxy the request
      // TODO: here comes format validation
      response.result = await this.routeContentScriptRPCRequest(
        originPermission,
        event.request.method,
        event.request.params,
        origin
      );
    } else if (
      event.request.method === 'wallet_addEthereumChain' ||
      event.request.method === 'wallet_switchEthereumChain'
    ) {
      response.result = await this.routeSafeRPCRequest(
        event.request.method,
        event.request.params,
        origin
      );
    } else if (
      event.request.method === 'eth_requestAccounts' ||
      event.request.method === 'eth_accounts'
    ) {
      // if it's external communication AND the dApp does not have permission BUT asks for it
      // then let's ask the user what he/she thinks
      const state: RootState =
        this.mainServiceManager.store.getState() as RootState;
      const address = state.account.account;
      const network = state.network.activeNetwork;

      if (!address) {
        response.result = new EIP1193Error(
          EIP1193_ERROR_CODES.userRejectedRequest
        ).toJSON();
      } else {
        // Get last prefferec chainID for the DAPP
        //   const dAppChainID = Number(
        //     (await this.internalEthereumProviderService.routeSafeRPCRequest(
        //       "eth_chainId",
        //       [],
        //       origin
        //     )) as string
        //   ).toString()

        // these params are taken directly from the dapp website
        const [title, faviconUrl] = event.request.params as string[];
        const permissionRequest: PermissionRequest = {
          key: `${origin}_${address}_${network.chainID}`,
          origin,
          chainID: network.chainID,
          faviconUrl: faviconUrl || tab?.favIconUrl || '', // if favicon was not found on the website then try with browser's `tab`
          title,
          state: 'request',
          accountAddress: address,
        };
        // TODO:// add ask permision from a user in popup
        const blockUntilUserAction = await this.requestPermission(
          permissionRequest
        );
        await blockUntilUserAction;

        // Fetch the latest permission
        const persistedPermission = await this.checkPermission(origin);
        if (typeof persistedPermission !== 'undefined') {
          // if agrees then let's return the account data

          response.result = await this.routeContentScriptRPCRequest(
            persistedPermission,
            'eth_accounts',
            event.request.params,
            origin
          );
        } else {
          console.log('here?');
          // if user does NOT agree, then reject
          response.result = new EIP1193Error(
            EIP1193_ERROR_CODES.userRejectedRequest
          ).toJSON();
        }
      }
    } else {
      // sorry dear dApp, there is no love for you here
      response.result = new EIP1193Error(
        EIP1193_ERROR_CODES.unauthorized
      ).toJSON();
    }
    port.postMessage(response);
  }

  async checkPermission(
    origin: string
  ): Promise<PermissionRequest | undefined> {
    const state: RootState =
      this.mainServiceManager.store.getState() as RootState;

    const account = state.account.account || '';

    return state.dappPermissions.allowed.evm[`${origin}_${account}`];
  }

  async grantPermission(permission: PermissionRequest): Promise<void> {
    // FIXME proper error handling if this happens - should not tho
    if (permission.state !== 'allow' || !permission.accountAddress) return;

    if (this.#pendingRequests[permission.origin]) {
      this.#pendingRequests[permission.origin].resolve(permission);
      delete this.#pendingRequests[permission.origin];
    }
  }

  async resolveRequest(origin: string, result: any): Promise<void> {
    if (this.#pendingRequests[origin]) {
      this.#pendingRequests[origin].resolve(result);
      delete this.#pendingRequests[origin];
    }
  }

  async rejectRequest(origin: string, result: any): Promise<void> {
    if (this.#pendingRequests[origin]) {
      this.#pendingRequests[origin].reject(result);
      delete this.#pendingRequests[origin];
    }
  }

  async denyOrRevokePermission(permission: PermissionRequest) {
    if (permission.state !== 'deny' || !permission.accountAddress) {
      return;
    }

    if (this.#pendingRequests[permission.origin]) {
      this.#pendingRequests[permission.origin].reject('Time to move on');
      delete this.#pendingRequests[permission.origin];
    }

    this.notifyContentScriptsAboutAddressChange();
  }

  notifyContentScriptsAboutAddressChange(newAddress?: string): void {
    this.openPorts.forEach(async (port) => {
      // we know that url exists because it was required to store the port
      const { origin } = new URL(port.sender?.url as string);
      const { chainID } = (
        this.mainServiceManager.store.getState() as RootState
      ).network.activeNetwork;

      if (await this.checkPermission(origin, chainID)) {
        port.postMessage({
          id: 'aa-extension',
          result: {
            method: 'aa-extension_accountChanged',
            address: [newAddress],
          },
        });
      } else {
        port.postMessage({
          id: 'aa-extension',
          result: {
            method: 'aa-extension_accountChanged',
            address: [],
          },
        });
      }
    });
  }

  async requestPermission(
    permissionRequest: PermissionRequest
  ): Promise<unknown> {
    this.emitter.emit('requestPermission', permissionRequest);
    this.mainServiceManager.store.dispatch(
      requestPermission(permissionRequest)
    );
    await showExtensionPopup(AllowedQueryParamPage.dappPermission);

    return new Promise((resolve, reject) => {
      this.#pendingRequests[permissionRequest.origin] = {
        resolve,
        reject,
      };
    });
  }

  private async signData(
    {
      input,
      account,
    }: {
      input: string;
      account: string;
    },
    origin: string
  ) {
    const state: RootState =
      this.mainServiceManager.store.getState() as RootState;

    const hexInput = input.match(/^0x[0-9A-Fa-f]*$/)
      ? input
      : hexlify(toUtf8Bytes(input));
    const typeAndData = parseSigningData(input);
    const currentNetwork = state.network.activeNetwork;

    this.mainServiceManager.store.dispatch(
      signDataRequest({
        origin: origin,
        account: {
          address: account,
          network: currentNetwork,
        },
        rawSigningData: hexInput,
        ...typeAndData,
      })
    );

    return new Promise(async (resolve, reject) => {
      this.#pendingRequests[origin] = { resolve, reject };
    });
  }

  private async sendTransaction(
    transactionRequest: JsonRpcTransactionRequest,
    origin: string
  ) {
    this.mainServiceManager.store.dispatch(
      sendTransactionRequest({
        transactionRequest: transactionRequest,
        origin: origin,
      })
    );

    return new Promise(async (resolve, reject) => {
      this.#pendingRequests[origin] = { resolve, reject };
    });
  }

  async routeSafeRPCRequest(
    method: string,
    params: RPCRequest['params'],
    origin: string
  ): Promise<unknown> {
    const state: RootState =
      this.mainServiceManager.store.getState() as RootState;

    const provider = new ethers.providers.JsonRpcProvider(
      state.network.activeNetwork.provider
    );

    switch (method) {
      // supported alchemy methods: https://docs.alchemy.com/alchemy/apis/ethereum
      //   case 'eth_signTypedData':
      //   case 'eth_signTypedData_v1':
      //   case 'eth_signTypedData_v3':
      //   case 'eth_signTypedData_v4':
      // return this.signTypedData({
      //   account: {
      //     address: params[0] as string,
      //     network: state.network.activeNetwork,
      //   },
      //   typedData: JSON.parse(params[1] as string),
      // });
      case 'eth_chainId':
        return toHexChainID(state.network.activeNetwork.chainID);
      case 'eth_blockNumber':
      case 'eth_call':
      case 'eth_estimateGas':
      case 'eth_feeHistory':
      case 'eth_gasPrice':
      case 'eth_getBalance':
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber':
      case 'eth_getBlockTransactionCountByHash':
      case 'eth_getBlockTransactionCountByNumber':
      case 'eth_getCode':
      case 'eth_getFilterChanges':
      case 'eth_getFilterLogs':
      case 'eth_getLogs':
      case 'eth_getProof':
      case 'eth_getStorageAt':
      case 'eth_getTransactionByBlockHashAndIndex':
      case 'eth_getTransactionByBlockNumberAndIndex':
      case 'eth_getTransactionByHash':
      case 'eth_getTransactionCount':
      case 'eth_getTransactionReceipt':
      case 'eth_getUncleByBlockHashAndIndex':
      case 'eth_getUncleByBlockNumberAndIndex':
      case 'eth_getUncleCountByBlockHash':
      case 'eth_getUncleCountByBlockNumber':
      case 'eth_maxPriorityFeePerGas':
      case 'eth_newBlockFilter':
      case 'eth_newFilter':
      case 'eth_newPendingTransactionFilter':
      case 'eth_protocolVersion':
      case 'eth_sendRawTransaction':
      case 'eth_subscribe':
      case 'eth_syncing':
      case 'eth_uninstallFilter':
      case 'eth_unsubscribe':
      case 'net_listening':
      case 'net_version':
      case 'web3_clientVersion':
      case 'web3_sha3':
        return provider.send(method, params);
      case 'eth_accounts': {
        // This is a special method, because Alchemy provider DO support it, but always return null (because they do not store keys.)
        const address = state.account.account;
        return [address];
      }
      case 'eth_sendTransaction':
        return this.sendTransaction(
          {
            ...(params[0] as JsonRpcTransactionRequest),
          },
          origin
        );
      //   case 'eth_signTransaction':
      //     return this.signTransaction(
      //       params[0] as JsonRpcTransactionRequest,
      //       origin
      //     ).then((signedTransaction) =>
      //       serializeEthersTransaction(
      //         ethersTransactionFromSignedTransaction(signedTransaction),
      //         {
      //           r: signedTransaction.r,
      //           s: signedTransaction.s,
      //           v: signedTransaction.v,
      //         }
      //       )
      //     );
      //   case 'eth_sign': // --- important wallet methods ---
      //     return this.signData(
      //       {
      //         input: params[1] as string,
      //         account: params[0] as string,
      //       },
      //       origin
      //     );
      case 'personal_sign':
        return this.signData(
          {
            input: params[0] as string,
            account: params[1] as string,
          },
          origin
        );
      case 'wallet_addEthereumChain': {
        // const chainInfo = params[0] as AddEthereumChainParameter;
        // const { chainId } = chainInfo;
        //   const supportedNetwork = await this.getTrackedNetworkByChainId(chainId);
        //     if (supportedNetwork) {
        //       this.switchToSupportedNetwork(origin, supportedNetwork);
        //       return null;
        //     }
        //     if (!FeatureFlags.SUPPORT_CUSTOM_NETWORKS) {
        //       // Dissallow adding new chains until feature flag is turned on.
        throw new EIP1193Error(EIP1193_ERROR_CODES.userRejectedRequest);
        //     }
        //     try {
        //       const validatedParam = validateAddEthereumChainParameter(chainInfo);
        //       await this.chainService.addCustomChain(validatedParam);
        //       return null;
        //     } catch (e) {
        //       logger.error(e);
        //       throw new EIP1193Error(EIP1193_ERROR_CODES.userRejectedRequest);
        //     }
      }
      case 'wallet_switchEthereumChain': {
        // const newChainId = (params[0] as SwitchEthereumChainParameter).chainId;
        //     const supportedNetwork = await this.getTrackedNetworkByChainId(
        //       newChainId
        //     );
        //     if (supportedNetwork) {
        //       this.switchToSupportedNetwork(origin, supportedNetwork);
        //       return null;
        //     }
        throw new EIP1193Error(EIP1193_ERROR_CODES.chainDisconnected);
      }
      case 'metamask_getProviderState': // --- important MM only methods ---
      case 'metamask_sendDomainMetadata':
      case 'wallet_requestPermissions':
      case 'wallet_watchAsset':
      case 'estimateGas': // --- eip1193-bridge only method --
      case 'eth_coinbase': // --- MM only methods ---
      case 'eth_decrypt':
      case 'eth_getEncryptionPublicKey':
      case 'eth_getWork':
      case 'eth_hashrate':
      case 'eth_mining':
      case 'eth_submitHashrate':
      case 'eth_submitWork':
      case 'metamask_accountsChanged':
      case 'metamask_chainChanged':
      case 'metamask_logWeb3ShimUsage':
      case 'metamask_unlockStateChanged':
      case 'metamask_watchAsset':
      case 'net_peerCount':
      case 'wallet_accountsChanged':
      case 'wallet_registerOnboarding':
      default:
        throw new EIP1193Error(EIP1193_ERROR_CODES.unsupportedMethod);
    }
  }

  async routeSafeRequest(
    method: string,
    params: unknown[],
    origin: string,
    popupPromise: Promise<browser.Windows.Window>
  ): Promise<unknown> {
    const response = await this.routeSafeRPCRequest(
      method,
      params,
      origin
    ).finally(async () => {
      // Close the popup once we're done submitting.
      const popup = await popupPromise;
      if (typeof popup.id !== 'undefined') {
        browser.windows.remove(popup.id);
      }
    });
    return response;
  }

  async routeContentScriptRPCRequest(
    enablingPermission: PermissionRequest,
    method: string,
    params: RPCRequest['params'],
    origin: string
  ): Promise<unknown> {
    try {
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [enablingPermission.accountAddress];
        // case 'eth_signTypedData':
        // case 'eth_signTypedData_v1':
        // case 'eth_signTypedData_v3':
        // case 'eth_signTypedData_v4':
        //   checkPermissionSignTypedData(
        //     params[0] as HexString,
        //     enablingPermission
        //   );

        //   return await this.routeSafeRequest(
        //     method,
        //     params,
        //     origin,
        //     showExtensionPopup(AllowedQueryParamPage.signData)
        //   );
        // case 'eth_sign':
        //   checkPermissionSign(params[0] as HexString, enablingPermission);

        //   return await this.routeSafeRequest(
        //     method,
        //     params,
        //     origin,
        //     showExtensionPopup(AllowedQueryParamPage.personalSignData)
        //   );
        case 'personal_sign':
          checkPermissionSign(params[1] as HexString, enablingPermission);

          return await this.routeSafeRequest(
            method,
            params,
            origin,
            showExtensionPopup(AllowedQueryParamPage.personalSignData)
          );
        // case 'eth_signTransaction':
        case 'eth_sendTransaction':
          checkPermissionSignTransaction(
            {
              // A dApp can't know what should be the next nonce because it can't access
              // the information about how many tx are in the signing process inside the
              // wallet. Nonce should be assigned only by the wallet.
              ...(params[0] as EthersTransactionRequest),
              nonce: undefined,
            },
            enablingPermission
          );

          return await this.routeSafeRequest(
            method,
            params,
            origin,
            showExtensionPopup(AllowedQueryParamPage.signTransaction)
          );

        default: {
          return await this.routeSafeRPCRequest(method, params, origin);
        }
      }
    } catch (error) {
      return this.handleRPCErrorResponse(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  handleRPCErrorResponse(error: unknown) {
    let response;
    console.error('error processing request', error);
    if (typeof error === 'object' && error !== null) {
      /**
       * Get error per the RPC method’s specification
       */
      if ('eip1193Error' in error) {
        const { eip1193Error } = error as {
          eip1193Error: EIP1193ErrorPayload;
        };
        if (isEIP1193Error(eip1193Error)) {
          response = eip1193Error;
        }
        /**
         * In the case of a non-matching error message, the error is returned without being nested in an object.
         * This is due to the error handling implementation.
         * Check the code for more details https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts#L96:L130
         */
      } else if ('body' in error) {
        response = parsedRPCErrorResponse(error as { body: string });
      } else if ('error' in error) {
        response = parsedRPCErrorResponse(
          (error as { error: { body: string } }).error
        );
      }
    }
    /**
     * If no specific error is obtained return a user rejected request error
     */
    return (
      response ??
      new EIP1193Error(EIP1193_ERROR_CODES.userRejectedRequest).toJSON()
    );
  }
}
