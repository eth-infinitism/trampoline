import React, { useCallback, useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { configureChains, createClient, goerli, WagmiConfig } from 'wagmi';
import { useBackgroundSelector } from '../App/hooks';
import { InitializeKeyring } from '../App/pages/keyring';
import {
  ProtectedRouteHasAccounts,
  ProtectedRouteKeyringUnlocked,
} from '../App/protected-route';
import { getAddressCount } from '../Background/redux-slices/selectors/accountSelectors';
import DappPermission from './pages/dapp-permission';
import Home from './pages/home';
import SignMessageRequest from './pages/sign-message';
import SignTransactionRequest from './pages/sign-transaction-request';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { getActiveNetwork } from '../Background/redux-slices/selectors/networkSelectors';
import Config from '../../exconfig.json';
console.debug('---- LAUNCHING WITH CONFIG ----', Config);

const Popup = () => {
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const hasAccounts = useBackgroundSelector(
    (state) => getAddressCount(state) > 0
  );

  const openExpandedView = useCallback(() => {
    const url = chrome.runtime.getURL('app.html');
    chrome.tabs.create({
      url,
    });
  }, []);

  useEffect(() => {
    if (!hasAccounts) {
      openExpandedView();
    }
  }, [hasAccounts, openExpandedView]);

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
          path="/dapp-permission"
          element={
            <ProtectedRouteHasAccounts>
              <DappPermission />
            </ProtectedRouteHasAccounts>
          }
        />
        <Route
          path="/personal-sign"
          element={
            <ProtectedRouteHasAccounts>
              <SignMessageRequest />
            </ProtectedRouteHasAccounts>
          }
        />

        <Route
          path="/sign-transaction"
          element={
            <ProtectedRouteHasAccounts>
              <SignTransactionRequest />
            </ProtectedRouteHasAccounts>
          }
        />
      </Routes>
    </WagmiConfig>
  );
};

export default Popup;
