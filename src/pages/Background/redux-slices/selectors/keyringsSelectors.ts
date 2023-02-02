import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { KeyringsState } from '../keyrings';

export const selectKeyrings = createSelector(
  (state: RootState) => state.keyrings,
  (keyrings) => keyrings
);

export const selectLoadedKeyrings = createSelector(
  selectKeyrings,
  (keyrings) => keyrings.keyrings
);

export const selectKeyringStatus = createSelector(
  selectKeyrings,
  (keyrings) => (keyrings as KeyringsState).status
);

export const selectKeyringVault = createSelector(
  selectKeyrings,
  (keyrings) => (keyrings as KeyringsState).vault
);

export const selectKeyringView = createSelector(
  [selectKeyrings, (state, implementation: string) => implementation],
  (keyrings, implementation: string) =>
    (keyrings as KeyringsState).keyringMetadata[implementation]
      ? (keyrings as KeyringsState).keyringMetadata[implementation].view
      : undefined
);
