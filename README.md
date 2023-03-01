# Trampoline Example

<img src="src/assets/img/icon-128.png" width="64"/>

This is an example project made on the [Trampoline project](https://github.com/plusminushalf/trampoline). Trampoline is a chrome extension boilerplate code to showcase your own Smart Contract Wallets with React 18 and Webpack 5 support.

## Installation and Running

### Steps:

1. Verify that your [Node.js](https://nodejs.org/) version is >= **18.12.0**.
2. Clone this repository.
3. Make sure you configure the `provider` in `src/exconfig.json` to the `Goerli` network.
4. Edit the `bundler` URL pointing to `Goerli` network and accepting EntryPoint=`0x0576a174D229E3cFA37253523E645A78A0C91B57`
5. Run `yarn install` to install the dependencies.
6. Run `yarn start`
7. Load your extension in Chrome by following these steps:
   1. Go to `chrome://extensions/`
   2. Enable `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.

### Custom Network

1. Make sure EntryPoint is deployed on the target network.
2. Edit the `entryPointAddress` in `src/exconfig.json`.
3. Add your network details in `hardhat.condig.ts`.
4. Deploy the factory using `ETHERSCAN_API_KEY=<optional> INFURA_ID=<required> npx hardhat deploy --network <network>`.
5. Edit the `factory_address` in `src/exconfig.json`
6. Edit the `bundler` url in `src/exconfig.json` that points to your network and accepts requests for your EntryPoint.
7. Run `yarn start`