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
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { useBackgroundSelector } from './hooks';
import { getActiveNetwork } from '../Background/redux-slices/selectors/networkSelectors';
import DeployAccount from './pages/deploy-account';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import '../Content/index';

import Config from '../../exconfig';
import TransferAsset from './pages/transfer-asset';
console.debug('---- LAUNCHING WITH CONFIG ----', Config);

const App = () => {
  const activeNetwork = useBackgroundSelector(getActiveNetwork);

  const wagmiConfig = useMemo(() => {
    const { publicClient, webSocketPublicClient } = configureChains(
      [goerli],
      [
        jsonRpcProvider({
          rpc: (chain) => ({
            http: activeNetwork.provider,
          }),
        }),
      ]
    );

    return createConfig({
      autoConnect: false,
      publicClient,
      webSocketPublicClient,
    });
  }, [activeNetwork]);

  return (
    <WagmiConfig config={wagmiConfig}>
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
          path="/transfer-assets"
          element={
            <ProtectedRouteHasAccounts>
              <ProtectedRouteKeyringUnlocked>
                <TransferAsset />
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
