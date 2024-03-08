import { EVMNetwork } from './pages/Background/types/network';
import EthDiamondImage from './assets/img/eth-diamond-glyph.png';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  enablePasswordEncryption: false,
  showTransactionConfirmationScreen: true,
  factory_address: '0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985',
  stateVersion: '0.1',
  network: {
    chainID: '1337',
    family: 'EVM',
    name: 'local',
    provider: 'http://127.0.0.1:8545/',
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    bundler: 'http://localhost:3000/rpc',
    baseAsset: {
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      image: EthDiamondImage,
    },
  } satisfies EVMNetwork,
};
