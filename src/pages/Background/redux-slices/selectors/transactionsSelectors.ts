import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const getTransactionsState = (state: RootState) => state.transactions;

export const selectCurrentPendingModifiedSendTransactionRequest =
  createSelector(getTransactionsState, (transactions) => ({
    transactionRequest: transactions.modifiedTransactionRequest,
  }));

export const selectCurrentPendingSendTransactionRequest = createSelector(
  getTransactionsState,
  (transactions) => ({
    transactionRequest: transactions.transactionRequest,
    origin: transactions.requestOrigin,
  })
);

export const selectCurrentPendingSendTransactionUserOp = createSelector(
  getTransactionsState,
  (transactions) => transactions.unsignedUserOperation
);
