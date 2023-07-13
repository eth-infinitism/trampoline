import MainServiceManager from '../services/main';
import { encodeJSON } from '../utils';
import { devToolsEnhancer } from '@redux-devtools/remote';
import {
  Action,
  AnyAction,
  Dispatch,
  combineReducers,
  configureStore,
  isPlain,
} from '@reduxjs/toolkit';
import { alias } from 'webext-redux';
import account from './account';
import keyrings from './keyrings';
import network from './network';
import transactions from './transactions';
import dappPermissions from './permissions';
import signing from './signing';
import { allAliases } from './utils';
import Config from '../../../exconfig';
import { debounce } from '@mui/material';

const rootReducer = combineReducers({
  account,
  keyrings,
  network,
  dappPermissions,
  signing,
  transactions,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;

// This sanitizer runs on store and action data before serializing for remote
// redux devtools. The goal is to end up with an object that is directly
// JSON-serializable and deserializable; the remote end will display the
// resulting objects without additional processing or decoding logic.
const devToolsSanitizer = (input: unknown) => {
  switch (typeof input) {
    // We can make use of encodeJSON instead of recursively looping through
    // the input
    case 'bigint':
    case 'object':
      return JSON.parse(encodeJSON(input));
    // We only need to sanitize bigints and objects that may or may not contain
    // them.
    default:
      return input;
  }
};

const persistStoreFn = <T>(state: T) => {
  // Browser extension storage supports JSON natively, despite that we have
  // to stringify to preserve BigInts
  localStorage.setItem('state', encodeJSON(state));
  localStorage.setItem('version', Config.stateVersion);
};

const persistStoreState = debounce(persistStoreFn, 50);

const reduxCache =
  (store: ReduxStoreType) =>
  (next: Dispatch<AnyAction>) =>
  (action: Action) => {
    const result = next(action);
    const state = store.getState();

    persistStoreState(state);
    return result;
  };

export const initializeStore = (
  preloadedState: RootState,
  mainServiceManager: MainServiceManager
) =>
  configureStore({
    preloadedState: preloadedState,
    reducer: rootReducer,
    devTools: false,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          isSerializable: (value: unknown) =>
            isPlain(value) || typeof value === 'bigint',
        },
        thunk: { extraArgument: { mainServiceManager } },
      });

      middleware.unshift(alias(allAliases));
      middleware.push(reduxCache as any);

      return middleware as any;
    },
    enhancers: (() => {
      const enhancers = [];

      if (process.env.NODE_ENV === 'development') {
        enhancers.push(
          devToolsEnhancer({
            hostname: 'localhost',
            port: 8000,
            realtime: true,
            actionSanitizer: devToolsSanitizer,
            stateSanitizer: devToolsSanitizer,
          })
        );
      }

      return enhancers;
    })(),
  });

export type ReduxStoreType = ReturnType<typeof initializeStore>;
export type BackgroundDispatch = ReduxStoreType['dispatch'];
