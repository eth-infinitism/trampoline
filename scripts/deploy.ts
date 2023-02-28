// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers } from 'hardhat';
import Config from '../src/exconfig.json';

async function main() {
  const TwoOwnerAccountFactory = await ethers.getContractFactory(
    'TwoOwnerAccountFactory'
  );
  const twoOwnerAccount = await TwoOwnerAccountFactory.deploy(
    Config.network.entryPointAddress
  );

  await twoOwnerAccount.deployed();

  console.log(`TwoOwnerAccountFactory deployed to ${twoOwnerAccount.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
