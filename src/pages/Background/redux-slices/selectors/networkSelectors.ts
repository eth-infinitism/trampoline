import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';

const getNetworkState = (state: RootState) => state.network;

export const getActiveNetwork = createSelector(
  getNetworkState,
  (network) => network.activeNetwork
);

export const getSupportedNetworks = createSelector(
  getNetworkState,
  (network) => network.supportedNetworks
);
