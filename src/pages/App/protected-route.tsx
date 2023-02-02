import React, { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAddressCount } from '../Background/redux-slices/selectors/accountSelectors';
import { useAreKeyringsUnlocked, useBackgroundSelector } from './hooks';

export const ProtectedRouteHasAccounts = ({
  children,
}: {
  children: ReactElement;
}) => {
  const hasAccounts = useBackgroundSelector(
    (state) => getAddressCount(state) > 0
  );
  let location = useLocation();

  if (!hasAccounts) {
    return (
      <Navigate to="/onboarding/intro" state={{ from: location }} replace />
    );
  }
  return children;
};

export const ProtectedRouteKeyringUnlocked = ({
  children,
}: {
  children: ReactElement;
}) => {
  const { pathname } = useLocation();

  const areKeyringsUnlocked: boolean = useAreKeyringsUnlocked(true, pathname);

  if (areKeyringsUnlocked) return children;
  return <></>;
};
