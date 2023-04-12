import { EVMNetwork } from './pages/Background/types/network';

const networks: EVMNetwork[] = [
  {
    chainID: '5',
    family: 'EVM',
    name: 'LocalGoerli',
    provider: 'http://localhost:8545',
    entryPointAddress: '0x0576a174D229E3cFA37253523E645A78A0C91B57',
    bundler: 'http://localhost:4337',
    baseAsset: {
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      image:
        'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    },
  },
  {
    chainID: '11155111',
    family: 'EVM',
    name: 'LocalSepolia',
    provider: 'http://localhost:9545',
    entryPointAddress: '0x0576a174D229E3cFA37253523E645A78A0C91B57',
    bundler: 'http://localhost:5337',
    baseAsset: {
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      image:
        'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    },
  },
];

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  enablePasswordEncryption: false,
  showTransactionConfirmationScreen: true,
  factory_address: '0x09c58cf6be8E25560d479bd52B4417d15bCA2845',
  stateVersion: '0.1',
  networks,
};
