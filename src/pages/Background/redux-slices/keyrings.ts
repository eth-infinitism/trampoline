import { createSlice } from '@reduxjs/toolkit';
import { Keyring, KeyringMetadata } from '../types/keyrings';
import { createBackgroundAsyncThunk } from './utils';
import { NewAccountView } from '../types/chrome-messages';
import { RootState } from '.';
import KeyringService from '../services/keyring';
import { addNewAccount } from './account';
import { EVMNetwork } from '../types/network';

export type Vault = {
  vault: string;
  encryptionKey?: string;
  encryptionSalt?: string;
};

export type KeyringsState = {
  keyrings: Keyring[];
  keyringMetadata: {
    [keyringId: string]: KeyringMetadata;
  };
  importing: false | 'pending' | 'done';
  status: 'locked' | 'unlocked' | 'uninitialized';
  vault: Vault;
  keyringToVerify: {
    id: string;
    mnemonic: string[];
  } | null;
};

export const initialState: KeyringsState = {
  keyrings: [],
  keyringMetadata: {},
  vault: {
    vault: '',
  },
  importing: false,
  status: 'uninitialized',
  keyringToVerify: null,
};

const keyringsSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    keyringLocked: (state) => ({
      ...state,
      status: state.status !== 'uninitialized' ? 'locked' : 'uninitialized',
      vault: {
        vault: state.vault.vault,
      },
    }),
    keyringUnlocked: (state) => ({ ...state, status: 'unlocked' }),
    vaultUpdate: (
      state,
      {
        payload: vault,
      }: {
        payload: Vault;
      }
    ) => ({
      ...state,
      vault,
      status:
        !vault.encryptionKey && state.status !== 'uninitialized'
          ? 'locked'
          : state.status,
    }),
  },
});

export const { keyringLocked, vaultUpdate, keyringUnlocked } =
  keyringsSlice.actions;
export default keyringsSlice.reducer;

/**
 * -------------------------------
 * Background Actions
 * -------------------------------
 */

export const initializeKeyring = createBackgroundAsyncThunk(
  'keyring/initialize',
  async (password: string, { dispatch, extra: { mainServiceManager } }) => {
    const keyringService = mainServiceManager.getService(
      KeyringService.name
    ) as KeyringService;
    await keyringService.createPassword(password);
  }
);

export const createNewAccount = createBackgroundAsyncThunk(
  'keyring/createNewAccount',
  async (
    {
      name,
      implementation,
      context,
      chainIds,
    }: {
      name: string;
      chainIds: Array<string>;
      implementation: string;
      context?: any;
    },
    { dispatch, extra: { mainServiceManager } }
  ) => {
    const keyringService = mainServiceManager.getService(
      KeyringService.name
    ) as KeyringService;
    try {
      const address = await keyringService.addAccount(implementation, context);
      dispatch(
        addNewAccount({
          name,
          makeActive: true,
          chainIds: chainIds,
          address: address,
        })
      );
    } catch (e) {
      console.log(e);
    }
  }
);
