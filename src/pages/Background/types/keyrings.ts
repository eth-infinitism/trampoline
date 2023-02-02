import { KeyringView } from '@epf-wallet/keyring-controller';

export type Keyring = {
  id: string | null;
  addresses: string[];
};

export interface KeyringMetadata {
  view: KeyringView | null;
  source: 'import' | 'internal';
}
