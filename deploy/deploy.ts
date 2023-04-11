import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import config from '../src/exconfig';
import fs from 'fs';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();
  await hre.deployments.deploy('WebauthnAccountFactory', {
    from: accounts[0],
    deterministic: true,
    args: [config.network.entryPointAddress],
    log: true,
  });
  await hre.deployments.deploy('EllipticCurve', {
    from: accounts[0],
    deterministic: true,
    args: [],
    log: true,
  });
  //   await hre.deployments.deploy('Greeter', {
  //     from: accounts[0],
  //     deterministic: true,
  //     args: [],
  //     log: true,
  //   });
};
export default func;
