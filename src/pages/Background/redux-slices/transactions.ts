import { UserOperationStruct } from '@account-abstraction/contracts';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';
import KeyringService from '../services/keyring';
import ProviderBridgeService, {
  EthersTransactionRequest,
} from '../services/provider-bridge';
import { createBackgroundAsyncThunk } from './utils';

export type TransactionState = {
  transactionRequest?: EthersTransactionRequest;
  transactionsRequest?: EthersTransactionRequest[];
  modifiedTransactionsRequest?: EthersTransactionRequest[];

  requestOrigin?: string;
  userOperationRequest?: Partial<UserOperationStruct>;
  unsignedUserOperation?: UserOperationStruct;
};

export const initialState: TransactionState = {
  transactionsRequest: undefined,
  transactionRequest: undefined,
  userOperationRequest: undefined,
  unsignedUserOperation: undefined,
};

type SigningReducers = {
  sendTransactionRequest: (
    state: TransactionState,
    {
      payload,
    }: {
      payload: {
        transactionRequest: EthersTransactionRequest;
        origin: string;
      };
    }
  ) => TransactionState;
  sendTransactionsRequest: (
    state: TransactionState,
    {
      payload,
    }: {
      payload: {
        transactionsRequest: EthersTransactionRequest[];
        origin: string;
      };
    }
  ) => TransactionState;
  setModifyTransactionsRequest: (
    state: TransactionState,
    {
      payload,
    }: {
      payload: EthersTransactionRequest[];
    }
  ) => TransactionState;
  sendUserOperationRquest: (
    state: TransactionState,
    { payload }: { payload: UserOperationStruct }
  ) => TransactionState;
  setUnsignedUserOperation: (
    state: TransactionState,
    { payload }: { payload: UserOperationStruct }
  ) => TransactionState;
  clearTransactionState: (state: TransactionState) => TransactionState;
};

const transactionsSlice = createSlice<
  TransactionState,
  SigningReducers,
  'signing'
>({
  name: 'signing',
  initialState,
  reducers: {
    sendTransactionRequest: (
      state,
      {
        payload: { transactionRequest, origin },
      }: {
        payload: {
          transactionRequest: EthersTransactionRequest;
          origin: string;
        };
      }
    ) => {
      return {
        ...state,
        transactionRequest: transactionRequest,
        requestOrigin: origin,
      };
    },
    sendTransactionsRequest: (
      state,
      {
        payload: { transactionsRequest, origin },
      }: {
        payload: {
          transactionsRequest: EthersTransactionRequest[];
          origin: string;
        };
      }
    ) => {
      return {
        ...state,
        transactionsRequest: transactionsRequest,
        requestOrigin: origin,
      };
    },
    setModifyTransactionsRequest: (
      state,
      {
        payload,
      }: {
        payload: EthersTransactionRequest[];
      }
    ) => ({
      ...state,
      modifiedTransactionsRequest: payload,
    }),
    sendUserOperationRquest: (
      state,
      { payload }: { payload: UserOperationStruct }
    ) => ({
      ...state,
      userOperationRequest: payload,
    }),
    setUnsignedUserOperation: (
      state,
      { payload }: { payload: UserOperationStruct }
    ) => ({
      ...state,
      unsignedUserOperation: payload,
    }),
    clearTransactionState: (state) => ({
      ...state,
      typedDataRequest: undefined,
      signDataRequest: undefined,
    }),
  },
});

export const {
  sendTransactionRequest,
  sendTransactionsRequest,
  setModifyTransactionsRequest,
  sendUserOperationRquest,
  setUnsignedUserOperation,
  clearTransactionState,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;

export const sendTransaction = createBackgroundAsyncThunk(
  'transactions/sendTransaction',
  async (
    { address, context }: { address: string; context?: any },
    { dispatch, extra: { mainServiceManager } }
  ) => {
    const keyringService = mainServiceManager.getService(
      KeyringService.name
    ) as KeyringService;

    const state = mainServiceManager.store.getState() as RootState;
    const unsignedUserOp = state.transactions.unsignedUserOperation;
    const origin = state.transactions.requestOrigin;

    if (unsignedUserOp) {
      const signedUserOp = await keyringService.signUserOpWithContext(
        address,
        unsignedUserOp,
        context
      );
      const txnHash = keyringService.sendUserOp(address, signedUserOp);

      const providerBridgeService = mainServiceManager.getService(
        ProviderBridgeService.name
      ) as ProviderBridgeService;

      providerBridgeService.resolveRequest(origin || '', txnHash);
    }
  }
);

export const createUnsignedUserOp = createBackgroundAsyncThunk(
  'transactions/createUnsignedUserOp',
  async (address: string, { dispatch, extra: { mainServiceManager } }) => {
    const keyringService = mainServiceManager.getService(
      KeyringService.name
    ) as KeyringService;

    const state = mainServiceManager.store.getState() as RootState;
    const transactionRequest = state.transactions.transactionRequest;

    if (transactionRequest) {
      const userOp = await keyringService.createUnsignedUserOp(
        address,
        transactionRequest
      );
      dispatch(setUnsignedUserOperation(userOp));
    }
  }
);

export const modifyTransactionsRequest = createBackgroundAsyncThunk(
  'transactions/modifyTransactionsRequest',
  async (
    {
      address,
      modifiedTransactions,
    }: {
      address: string;
      modifiedTransactions: EthersTransactionRequest[];
    },
    { dispatch, extra: { mainServiceManager } }
  ) => {
    dispatch(setModifyTransactionsRequest(modifiedTransactions));

    const state = mainServiceManager.store.getState() as RootState;
    const modifiedTransactionsRequest =
      state.transactions.modifiedTransactionsRequest;
    const transactionsRequest = state.transactions.transactionsRequest;

    const transactions =
      modifiedTransactionsRequest || transactionsRequest || [];

    const keyringService = mainServiceManager.getService(
      KeyringService.name
    ) as KeyringService;

    const unsignedUserOperation =
      await keyringService.createUnsignedUserOpForTransactions(
        address,
        transactions
      );

    dispatch(setUnsignedUserOperation(unsignedUserOperation));
  }
);

export const rejectTransaction = createBackgroundAsyncThunk(
  'transactions/rejectTransaction',
  async (address: string, { dispatch, extra: { mainServiceManager } }) => {
    dispatch(clearTransactionState());

    const requestOrigin = (mainServiceManager.store.getState() as RootState)
      .transactions.requestOrigin;

    const providerBridgeService = mainServiceManager.getService(
      ProviderBridgeService.name
    ) as ProviderBridgeService;

    providerBridgeService.rejectRequest(requestOrigin || '', '');
  }
);
