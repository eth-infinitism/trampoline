// import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-deploy';
import '@typechain/hardhat';
import { HardhatUserConfig, HttpNetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-etherscan';
import './tasks/sendEth';
import Config from './src/exconfig';

const networks: { [networkName: string]: HttpNetworkUserConfig } = {};
Config.networks.map(({ name, provider }) => {
  networks[name] = {};
  return (networks[name].url = provider);
});

// const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`;
// let mnemonic = 'test '.repeat(11) + 'junk';
// if (fs.existsSync(mnemonicFileName)) {
//   mnemonic = fs.readFileSync(mnemonicFileName, 'ascii');
// }

const config: HardhatUserConfig = {
  networks,
  defaultNetwork: 'LocalGoerli',
  solidity: {
    compilers: [{ version: '0.8.12', settings: {} }, { version: '0.5.0' }],
  },
  typechain: {
    outDir: 'src/pages/Account/account-api/typechain-types',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
