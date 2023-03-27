import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './app';

const container = document.getElementById('fingerprint');

const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
