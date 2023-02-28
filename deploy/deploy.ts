import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../src/exconfig.json';
import fs from 'fs';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();
  await hre.deployments.deploy('TwoOwnerAccountFactory', {
    from: accounts[0],
    deterministic: true,
    args: [config.network.entryPointAddress],
    log: true,
  });
};
export default func;
