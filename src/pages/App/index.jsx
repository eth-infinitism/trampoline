import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import App from './app';
import './index.css';
import { Store } from 'webext-redux';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { HashRouter } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      // Purple and green play nicely together.
      main: '#650228',
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#C8366B',
    },
  },
});

const store = new Store();

Object.assign(store, {
  dispatch: store.dispatch.bind(store),
  getState: store.getState.bind(store),
  subscribe: store.subscribe.bind(store),
});

const container = document.getElementById('app-container');

store
  .ready()
  .then(() => {
    if (container) {
      const root = createRoot(container); // createRoot(container!) if you use TypeScript
      root.render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <HashRouter>
              <App />
            </HashRouter>
          </ThemeProvider>
        </Provider>
      );
    }
  })
  .catch(console.log);
