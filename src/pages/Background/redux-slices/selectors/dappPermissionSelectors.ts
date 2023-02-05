import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
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
