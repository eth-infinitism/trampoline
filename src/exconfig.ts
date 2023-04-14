// eslint-disable-next-line import/no-anonymous-default-export
export default {
  enablePasswordEncryption: false,
  showTransactionConfirmationScreen: false,
  factory_address: '0x6c0ec05Ad55C8B8427119ce50b6087E7B0C9c23e',
  eleptic_curve: '0x07A4E372cB55d243131182e8468F1eF5eB78347E',
  stateVersion: '0.3',
  network: {
    chainID: '11155111',
    family: 'EVM',
    name: 'Sepolia',
    provider: 'https://sepolia.infura.io/v3/bdabe9d2f9244005af0f566398e648da',
    entryPointAddress: '0x0576a174D229E3cFA37253523E645A78A0C91B57',
    bundler: 'http://localhost:3000/rpc',
    baseAsset: {
      symbol: 'ETH',
      name: 'ETH',
      decimals: 18,
      image:
        'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp',
    },
  },
};
