// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers } from 'hardhat';
import Config from '../src/exconfig.json';
import {
  TwoOwnerAccountFactory__factory,
  TwoOwnerAccount__factory,
} from '../src/pages/Account/account-api/typechain-types';

async function main() {
  const [signer] = await ethers.getSigners();
  //   signer.sendTransaction({
  //     to: '0x48E87c155f748d90A2B5fe8980eeD92805dEb5b6',
  //     value: ethers.utils.parseEther('100'),
  //   });

  signer.sendTransaction({
    to: '0xBFD2aE84CbE1e732aB05e6dB4a6cF56a6c7a286e',
    value: ethers.utils.parseEther('0.1'),
  });

  //   console.log(
  //     Buffer.from(
  //       '0x220266b60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000164141323320726576657274656420286f72204f4f472900000000000000000000'.replace(
  //         /0x/,
  //         ''
  //       ),
  //       'hex'
  //     ).toString()
  //   );

  //   const TwoOwnerAccountFactory = TwoOwnerAccountFactory__factory.connect(
  //     Config.factory_address,
  //     signer
  //   );

  //   const initCode =
  //     '0xc3e53f4d16ae77db1c982e75a937b9f60fe636901230aea2000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000f21633d542de68cbdbac5cd5adebe66ed5e0d9510000000000000000000000000000000000000000000000000000000000000000';

  //   const tx = await signer.sendTransaction({
  //     to: initCode.slice(0, 42),
  //     data: '0x' + initCode.slice(42),
  //   });
  //   console.log(tx);
  //   const resp = await tx.wait();
  //   console.log(resp);

  //   const address = await TwoOwnerAccountFactory.createAccount(
  //     '0xad01Bc2F695d0DBe4dA88be21e611851F5b515cC',
  //     '0xf21633D542dE68CBDbAc5cD5aDebe66ed5E0D951',
  //     0
  //   );
  //   console.log(address);

  // const twoOwnerAccount = TwoOwnerAccount__factory.connect(
  //   '0xfc827e40a25454864b8e796a5e21b3343dd71828',
  //   signer
  // );
  // const valid = await twoOwnerAccount.external_validateSignature(
  //   '0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000041908e00f35f7d5ec1f1d4053f31dcc02b64f40112c2b4d0d35bbf8a279e9eba2f1ebbcdc920061501b60b2832fe2b33e14381d3c7064e17005789dbf51287e95a1c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000417bc0e12c8fe782ae5c8823188df7a8fe22841674ac5e4655f8f1ac709c1687a4414012284eb6e0f09a2c0fd177534cf64685c0e96fe977dbadc66e7dc98449641b00000000000000000000000000000000000000000000000000000000000000',
  //   '0x0b52eab24be28e5882f6232277b49ff99fa2da71a5a791b2ba46a090bc0d578a'
  // );
  // console.log(valid);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
