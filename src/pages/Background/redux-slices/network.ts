import { createSlice } from '@reduxjs/toolkit';
import { EVMNetwork } from '../types/network';

export type Vault = {
  vault: string;
  encryptionKey?: string;
  encryptionSalt?: string;
};

export type NetworkState = {
  activeNetwork: EVMNetwork;
  supportedNetworks: Array<EVMNetwork>;
};

const GoerliNetwork: EVMNetwork = {
  chainID: '5',
  family: 'EVM',
  name: 'Goerli',
  provider: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  entryPointAddress: '0x2167fA17BA3c80Adee05D98F0B55b666Be6829d6',
  baseAsset: {
    symbol: 'ETH',
    name: 'ETH',
    decimals: 18,
    image:
      'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
  },
};

export const initialState: NetworkState = {
  activeNetwork: GoerliNetwork,
  supportedNetworks: [GoerliNetwork],
};

type NetworkReducers = {};

const networkSlice = createSlice<NetworkState, NetworkReducers, 'network'>({
  name: 'network',
  initialState,
  reducers: {},
});

export default networkSlice.reducer;
