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
  provider: 'https://goerli.infura.io/v3/bdabe9d2f9244005af0f566398e648da',
  entryPointAddress: '0x0F46c65C17AA6b4102046935F33301f0510B163A',
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
