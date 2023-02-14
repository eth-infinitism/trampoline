import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const getSigningState = (state: RootState) => state.signing;

export const selectCurrentPendingSignDataRequest = createSelector(
  getSigningState,
  (signing) => {
    return signing.signDataRequest;
  }
);
