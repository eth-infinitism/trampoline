import AccountApi from '../../Account/account-api';
import { AccountImplementationType } from '../../Account/account-api/types';
import { ActiveAccountImplementation } from '../../Account/';

const AccountImplementation: AccountImplementationType = AccountApi;

const AccountImplementations: {
  [name: string]: AccountImplementationType;
} = {
  [ActiveAccountImplementation]: AccountImplementation,
};

export const PROVIDER_BRIDGE_TARGET = 'aa-extension-provider-bridge';
export const WINDOW_PROVIDER_TARGET = 'aa-extension-window-provider';
export const EXTERNAL_PORT_NAME = 'aa-extension-external';

export const AA_EXTENSION_CONFIG = 'aa-extension_getConfig';

export { ActiveAccountImplementation, AccountImplementations };
