import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const getAccountState = (state: RootState) => state.account;

export const getAllAddresses = createSelector(getAccountState, (account) => {
  const ret = [
    ...Array.from(
      new Set(
        Object.values(account.accountsData.evm).flatMap((chainAddresses) =>
          Object.keys(chainAddresses)
        )
      )
    ),
  ];
  return ret;
});

const getAccountsData = createSelector(
  getAccountState,
  (account) => account.accountsData
);

export const getAccountsEVMData = createSelector(
  getAccountsData,
  (accountsData) => accountsData.evm
);

export const getAddressCount = createSelector(
  getAllAddresses,
  (allAddresses) => allAddresses.length
);

export const getAccountAdded = createSelector(
  getAccountState,
  (account) => account.accountAdded
);

export const getActiveAccount = createSelector(
  getAccountState,
  (account) => account.account
);

export const getAccountEVMData = createSelector(
  [
    getAccountsEVMData,
    (state, { chainId, address }: { chainId: string; address: string }) => ({
      chainId,
      address,
    }),
  ],
  (evm, { chainId, address }) => evm[chainId][address]
);

export const getAccountInfo = createSelector(
  [getAccountsData, (state, address) => address],
  (accountsData, address) => accountsData.info[address]
);

export const getAccountApiCallResult = createSelector(
  getAccountState,
  (account) => ({
    accountApiCallResult: account.accountApiCallResult,
    accountApiCallResultState: account.accountApiCallResultState,
  })
);
