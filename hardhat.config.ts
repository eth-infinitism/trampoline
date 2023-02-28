// import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import { HardhatUserConfig } from 'hardhat/types';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [{ version: '0.8.12', settings: {} }],
  },
};

export default config;
