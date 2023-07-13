// FIXME: This type came from '@epf-wallet/keyring-controller', but that
// package doesn't seem to exist.
type KeyringView = any;

export type Keyring = {
  id: string | null;
  addresses: string[];
};

export interface KeyringMetadata {
  view: KeyringView | null;
  source: 'import' | 'internal';
}
