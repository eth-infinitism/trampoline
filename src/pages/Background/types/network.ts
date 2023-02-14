import { HexString } from './common';

export type NetworkFamily = 'EVM';

/**
 * Base asset of the network
 * Should be structurally compatible with FungibleAsset
 */
export type NetworkBaseAsset = {
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string;
  image?: string;
};

/**
 * Represents a cryptocurrency network; these can potentially be L1 or L2.
 */
export type Network = {
  // two Networks must never share a name.
  name: string;
  baseAsset: NetworkBaseAsset;
  family: NetworkFamily;
  chainID?: string;
  provider: string;
  bundler: string;
  entryPointAddress: string;
};

/**
 * An EVM-style network which *must* include a chainID.
 */
export type EVMNetwork = Network & {
  chainID: string;
  family: 'EVM';
};

export type AddressOnNetwork = {
  address: HexString;
  network: EVMNetwork;
};
