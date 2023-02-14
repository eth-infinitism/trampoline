import { AnyAssetAmount } from './asset';
import { HexString } from './common';
import { EVMNetwork } from './network';

export type AccountBalance = {
  /**
   * The address whose balance was measured.
   */
  address: HexString;
  /**
   * The measured balance and the asset in which it's denominated.
   */
  assetAmount: AnyAssetAmount;
  /**
   * The network on which the account balance was measured.
   */
  network: EVMNetwork;
  /**
   * The block height at while the balance measurement is valid.
   */
  blockHeight?: string;
  /**
   * When the account balance was measured, using Unix epoch timestamps.
   */
  retrievedAt: number;
  /**
   * A loose attempt at tracking balance data provenance, in case providers
   * disagree and need to be disambiguated.
   */
  dataSource: 'alchemy' | 'local' | 'infura' | 'custom';
};
