// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers } from 'hardhat';

async function main() {
  const [signer] = await ethers.getSigners();
  signer.sendTransaction({
    to: '0x0A77cEdFB8459084aB81CF6786EadDaCf7974146',
    value: ethers.utils.parseEther('1'),
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
