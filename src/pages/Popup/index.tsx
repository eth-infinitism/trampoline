import React from 'react';
import Popup from './Popup';
import './index.css';
import { Store } from 'webext-redux';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

const store = new Store();

Object.assign(store, {
  dispatch: store.dispatch.bind(store),
  getState: store.getState.bind(store),
  subscribe: store.subscribe.bind(store),
});

store.ready().then(() => {
  const container = document.getElementById('popup');
  if (container) {
    const root = createRoot(container);
    root.render(
      <Provider store={store}>
        <HashRouter>
          <Popup />
        </HashRouter>
      </Provider>
    );
  }
});
