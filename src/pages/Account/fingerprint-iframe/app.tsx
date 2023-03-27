import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { CreatePassKey } from './pages/create-pass-key';
import GreetApp from './pages/greet';
import { RequestSign } from './pages/request-sign';

const App = () => {
  return (
    <Routes>
      <Route path="/create-new/:chromeid/:name" element={<CreatePassKey />} />
      <Route
        path="/request-sign/:chromeid/:requestId/:credentialId"
        element={<RequestSign />}
      />
      <Route path="/greet-app" element={<GreetApp />} />
    </Routes>
  );
};

export default App;
