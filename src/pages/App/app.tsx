import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  ProtectedRouteHasAccounts,
  ProtectedRouteKeyringUnlocked,
} from './protected-route';
import Home from './pages/home';
import Onboarding from './pages/onboarding';
import NewAccounts from './pages/new-accounts';
import { InitializeKeyring } from './pages/keyring';
import { WagmiConfig, createClient } from 'wagmi';
import { ethers } from 'ethers';
import { useBackgroundSelector } from './hooks';
import { getActiveNetwork } from '../Background/redux-slices/selectors/networkSelectors';
import DeployAccount from './pages/deploy-account';

const App = () => {
  const activeNetwork = useBackgroundSelector(getActiveNetwork);

  const client = useMemo(
    () =>
      createClient({
        autoConnect: true,
        provider: new ethers.providers.JsonRpcProvider(activeNetwork.provider),
      }),
    [activeNetwork]
  );

  return (
    <WagmiConfig client={client}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRouteHasAccounts>
              <ProtectedRouteKeyringUnlocked>
                <Home />
              </ProtectedRouteKeyringUnlocked>
            </ProtectedRouteHasAccounts>
          }
        />
        <Route
          path="/deploy-account"
          element={
            <ProtectedRouteHasAccounts>
              <ProtectedRouteKeyringUnlocked>
                <DeployAccount />
              </ProtectedRouteKeyringUnlocked>
            </ProtectedRouteHasAccounts>
          }
        />
        <Route
          path="/accounts/new"
          element={
            <ProtectedRouteKeyringUnlocked>
              <NewAccounts />
            </ProtectedRouteKeyringUnlocked>
          }
        />
        <Route path="/keyring/initialize" element={<InitializeKeyring />} />
        <Route path="/onboarding/intro" element={<Onboarding />} />
      </Routes>
    </WagmiConfig>
  );
};

export default App;
