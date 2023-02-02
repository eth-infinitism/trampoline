import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DomainName, HexString, URI } from '../types/common';
import { EVMNetwork } from '../types/network';
import { AccountBalance } from '../types/account';

type AccountData = {
  address: HexString;
  network: EVMNetwork;
  balances?: {
    [assetSymbol: string]: AccountBalance;
  };
  ens?: {
    name?: DomainName;
    avatarURL?: URI;
  };
  defaultName: string;
  defaultAvatar: string;
};

type AccountsByChainID = {
  [chainID: string]: {
    [address: string]: AccountData | 'loading';
  };
};

interface AccountState {
  account?: HexString;
  accountAdded: HexString | null;
  hasAccountError?: boolean;
  accountsData: {
    info: {
      [address: string]: {
        name: string;
      };
    };
    evm: AccountsByChainID;
  };
}

const initialState = {
  accountsData: { evm: {}, info: {} },
  accountAdded: null,
  combinedData: {
    totalMainCurrencyValue: '',
    assets: [],
  },
} as AccountState;

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    resetAccountAdded: (state): AccountState => ({
      ...state,
      accountAdded: null,
    }),
    addNewAccount: (
      state,
      {
        payload,
      }: {
        payload: {
          name: string;
          makeActive: boolean;
          chainIds: Array<string>;
          address: string;
        };
      }
    ): AccountState => ({
      ...state,
      account: payload.makeActive ? payload.address : state.account,
      accountAdded: payload.address,
      accountsData: {
        info: {
          ...state.accountsData.info,
          [payload.address]: {
            name: payload.name,
          },
        },
        evm: {
          ...state.accountsData.evm,
          ...payload.chainIds.reduce(
            (result: AccountsByChainID, chainId: string) => {
              result[chainId] = {
                [payload.address]: 'loading',
              };
              return result;
            },
            {}
          ),
        },
      },
    }),
  },
});

export const { addNewAccount, resetAccountAdded } = accountSlice.actions;
export default accountSlice.reducer;
