import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { HexString } from '../../types/common';
import { DappPermissionState } from '../permissions';

const getDappPermissionState = (state: RootState) => state.dappPermissions;

export const selectPermissionRequests = createSelector(
  getDappPermissionState,
  (slice: DappPermissionState) => Object.values(slice.permissionRequests)
);

export const selectPendingPermissionRequests = createSelector(
  selectPermissionRequests,
  (permissionRequests) => {
    return permissionRequests.filter((p) => p.state === 'request');
  }
);

export const selectCurrentPendingPermission = createSelector(
  selectPendingPermissionRequests,
  (permissionRequests) => {
    return permissionRequests.length > 0 ? permissionRequests[0] : undefined;
  }
);

export const selectOriginPermissionState = createSelector(
  getDappPermissionState,
  (slice: DappPermissionState) => slice.allowed.evm
);

export const selectCurrentOriginPermission = createSelector(
  [
    selectOriginPermissionState,
    (state, { origin, address }: { origin: string; address: HexString }) => ({
      origin,
      address,
    }),
  ],
  (evmState: DappPermissionState['allowed']['evm'], { origin, address }) =>
    evmState[`${origin}_${address}`]
);
