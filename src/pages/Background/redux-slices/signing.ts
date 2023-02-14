import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';
import KeyringService from '../services/keyring';
import ProviderBridgeService from '../services/provider-bridge';
import { HexString } from '../types/common';
import { AddressOnNetwork, EVMNetwork } from '../types/network';
import { createBackgroundAsyncThunk } from './utils';

export type Vault = {
  vault: string;
  encryptionKey?: string;
  encryptionSalt?: string;
};

export type NetworkState = {
  activeNetwork: EVMNetwork;
  supportedNetworks: Array<EVMNetwork>;
};

const GoerliNetwork: EVMNetwork = {
  chainID: '5',
  family: 'EVM',
  name: 'Goerli',
  provider: 'https://goerli.infura.io/v3/bdabe9d2f9244005af0f566398e648da',
  entryPointAddress: '0x0F46c65C17AA6b4102046935F33301f0510B163A',
  baseAsset: {
    symbol: 'ETH',
    name: 'ETH',
    decimals: 18,
    image:
      'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
  },
};

export type EIP712DomainType = {
  name?: string;
  version?: string;
  chainId?: number | string;
  verifyingContract?: HexString;
};

export interface TypedDataField {
  name: string;
  type: string;
}

export type EIP712TypedData<T = Record<string, unknown>> = {
  domain: EIP712DomainType;
  types: Record<string, TypedDataField[]>;
  message: T;
  primaryType: string;
};

export type SignTypedDataRequest = {
  account: AddressOnNetwork;
  typedData: EIP712TypedData;
};

export type EIP2612SignTypedDataAnnotation = {
  type: 'EIP-2612';
  source: string;
  displayFields: {
    owner: string;
    tokenContract: string;
    spender: string;
    value: string;
    nonce: number;
    expiry: string;
    token?: string;
  };
};

export type SignTypedDataAnnotation = EIP2612SignTypedDataAnnotation;

export type EnrichedSignTypedDataRequest = SignTypedDataRequest & {
  annotation?: SignTypedDataAnnotation;
};

export type EIP191Data = string;

// spec found https://eips.ethereum.org/EIPS/eip-4361
export interface EIP4361Data {
  /**
   * The message string that was parsed to produce this EIP-4361 data.
   */
  unparsedMessageData: string;
  domain: string;
  address: string;
  version: string;
  chainId: number;
  nonce: string;
  expiration?: string;
  statement?: string;
}

type EIP191SigningData = {
  messageType: 'eip191';
  signingData: EIP191Data;
};

type EIP4361SigningData = {
  messageType: 'eip4361';
  signingData: EIP4361Data;
};

export type MessageSigningData = EIP191SigningData | EIP4361SigningData;

export type MessageSigningRequest<
  T extends MessageSigningData = MessageSigningData
> = T & {
  origin: string;
  account: AddressOnNetwork;
  rawSigningData: string;
};

type SigningState = {
  signedTypedData: string | undefined;
  typedDataRequest: EnrichedSignTypedDataRequest | undefined;

  signedData: string | undefined;
  signDataRequest: MessageSigningRequest | undefined;
};

export const initialState: SigningState = {
  typedDataRequest: undefined,
  signedTypedData: undefined,

  signedData: undefined,
  signDataRequest: undefined,
};

type SigningReducers = {
  signedTypedData: (
    state: SigningState,
    { payload }: { payload: string }
  ) => SigningState;
  typedDataRequest: (
    state: SigningState,
    { payload }: { payload: EnrichedSignTypedDataRequest }
  ) => SigningState;
  signDataRequest: (
    state: SigningState,
    { payload }: { payload: MessageSigningRequest }
  ) => SigningState;
  signedData: (
    state: SigningState,
    { payload }: { payload: string }
  ) => SigningState;
  clearSigningState: (state: SigningState) => SigningState;
};

const signingSlice = createSlice<SigningState, SigningReducers, 'signing'>({
  name: 'signing',
  initialState,
  reducers: {
    signedTypedData: (state, { payload }: { payload: string }) => ({
      ...state,
      signedTypedData: payload,
      typedDataRequest: undefined,
    }),
    typedDataRequest: (
      state,
      { payload }: { payload: EnrichedSignTypedDataRequest }
    ) => ({
      ...state,
      typedDataRequest: payload,
    }),
    signDataRequest: (
      state,
      { payload }: { payload: MessageSigningRequest }
    ) => {
      return {
        ...state,
        signDataRequest: payload,
      };
    },
    signedData: (state, { payload }: { payload: string }) => ({
      ...state,
      signedData: payload,
      signDataRequest: undefined,
    }),
    clearSigningState: (state) => ({
      ...state,
      typedDataRequest: undefined,
      signDataRequest: undefined,
    }),
  },
});

export const {
  signedTypedData,
  typedDataRequest,
  signedData,
  signDataRequest,
  clearSigningState,
} = signingSlice.actions;

export default signingSlice.reducer;

export const getSignedData = createBackgroundAsyncThunk(
  'signing/getSignedData',
  async (context: any, { dispatch, extra: { mainServiceManager } }) => {
    const pendingSigningDataRequest = (
      mainServiceManager.store.getState() as RootState
    ).signing.signDataRequest;

    const keyringService = mainServiceManager.getService(
      KeyringService.name
    ) as KeyringService;

    const activeAccount = (mainServiceManager.store.getState() as RootState)
      .account.account;

    const signedMessage = await keyringService.personalSign(
      activeAccount || '',
      context,
      pendingSigningDataRequest
    );

    dispatch(signedData(signedMessage));

    const providerBridgeService = mainServiceManager.getService(
      ProviderBridgeService.name
    ) as ProviderBridgeService;

    providerBridgeService.resolveRequest(
      pendingSigningDataRequest?.origin || '',
      signedMessage
    );
  }
);
