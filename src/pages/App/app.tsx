import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  ProtectedRouteHasAccounts,
  ProtectedRouteKeyringUnlocked,
} from './protected-route';
import Home from './pages/home';
import Onboarding from './pages/onboarding';
import NewAccounts from './pages/new-accounts';
import { InitializeKeyring } from './pages/keyring';

const App = () => {
  return (
    <>
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
    </>
  );
};

export default App;
