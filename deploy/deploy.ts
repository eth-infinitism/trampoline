import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.getUnnamedAccounts();
  await hre.deployments.deploy('Greeter', {
    from: accounts[0],
    deterministicDeployment: true,
    args: ['Test'],
    log: true,
  });
};
export default func;
