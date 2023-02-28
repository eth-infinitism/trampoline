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
import { WagmiConfig, createClient, configureChains, goerli } from 'wagmi';
import { useBackgroundSelector } from './hooks';
import { getActiveNetwork } from '../Background/redux-slices/selectors/networkSelectors';
import DeployAccount from './pages/deploy-account';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import '../Content/index';

import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import Config from '../../exconfig.json';
console.debug('---- LAUNCHING WITH CONFIG ----', Config);

const App = () => {
  const activeNetwork = useBackgroundSelector(getActiveNetwork);

  const client = useMemo(() => {
    const { chains, provider, webSocketProvider } = configureChains(
      [goerli],
      [
        jsonRpcProvider({
          rpc: (chain) => ({
            http: activeNetwork.provider,
          }),
        }),
      ]
    );

    return createClient({
      provider,
      webSocketProvider,
      connectors: [
        new WalletConnectConnector({
          chains,
          options: {
            qrcode: true,
          },
        }),
      ],
    });
  }, [activeNetwork]);

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
