import {
  KeyringInputError,
  KeyringView,
  KeyringViewInputFieldValue,
  KeyringViewUserInput,
  StoreState,
  VaultState,
} from '@epf-wallet/keyring-controller';

export type ChromeMessages<T> = {
  type:
    | 'keyring/createPassword'
    | 'keyring/locked'
    | 'keyring/unlock'
    | 'keyring/unlocked'
    | 'keyring/vaultUpdate'
    | 'keyring/createKeyringForImplementation'
    | 'keyring/newAccountView'
    | 'keyring/validateKeyringViewInputValue'
    | 'keyring/addAcount';
  data?: T;
};

export type CreatePasswordChromeMessage = {
  password: string;
};

export type UnlockedKeyringChromeMessage = {
  storeState: StoreState;
};

export type UnlockKeyringChromeMessage = {
  password: string;
};

export type VaultUpdate = {
  vault: VaultState;
};

export type CreateKeyringForImplementation = {
  implementation: string;
};

export type NewAccountView = {
  implementation: string;
  view: KeyringView | undefined;
};

export type ValidateKeyringViewInputValue = {
  implementation: string;
  inputs: Array<KeyringViewInputFieldValue>;
};

export type KeyringInputErrorMessage = {
  errors: Array<KeyringInputError>;
};

export type AddAcount = {
  implementation: string;
  userInputs: KeyringViewUserInput;
};
