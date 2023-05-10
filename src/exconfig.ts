// eslint-disable-next-line import/no-anonymous-default-export
export default {
  enablePasswordEncryption: false,
  showTransactionConfirmationScreen: true,
  factory_address: '0x9406Cc6185a346906296840746125a0E44976454',
  stateVersion: '0.1',
  network: {
    chainID: '80001',
    family: 'EVM',
    name: 'Mumbai',
    provider: 'https://matic-mumbai.chainstacklabs.com',
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    bundler: 'http://localhost:3000/rpc',
    baseAsset: {
      symbol: 'MATIC',
      name: 'MATIC',
      decimals: 18,
      image: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=025',
    },
  },
};
