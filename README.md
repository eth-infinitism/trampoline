<img src="src/assets/img/logo.png" width="260"/>

Trampoline is a chrome extension boilerplate code to showcase your own Smart Contract Wallets with React 18 and Webpack 5 support.

## Installation and Running

### Steps:

1. Verify that your [Node.js](https://nodejs.org/) version is >= **18.12.0**.
2. Clone this repository.
3. Make sure you configure the `provider` in `src/exconfig.ts` to the `Goerli` network.
4. Edit the `bundler` URL pointing to `Goerli` network and accepting EntryPoint=`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`
5. Run `yarn install` to install the dependencies.
6. Run `yarn start`
7. Load your extension in Chrome by following these steps:
   1. Go to `chrome://extensions/`
   2. Enable `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.

> **Warning**
> Auto refresh is disabled by default, so you will have to manually refresh the page.
> If you make changes in background script or account-api, you will also have to refresh the background page. Check instructions on how to do that below.

> **Warning**
> Logs of all the blockchain interactions are shown in the background script. Do keep it open for faster debugging.

### How to see and refresh background page

1. Open extension's page: `chrome://extensions/`
2. Find the Trampoline extension, and click Details.
3. Check the `Inspect views` area and click on `background page` to inspect it's logs
4. To refresh click `cmd + r` or `ctrl + r` in the background inspect page to refresh the background script.
5. You can reload the extension completely too, the state is always kept in localstorage so nothing will be lost.

## Config

Config of the extension can be set in `exconfig.ts` file.

```ts
export default {
  // Enable or disable password for the user.
  enablePasswordEncryption: true,
  // Show default transaction screen
  showTransactionConfirmationScreen: true,
  // stateVersion is the version of state stored in localstorage of your browser. If you want to reset your extension, change this number to a new version and that will invalidate the older state.
  stateVersion: "0.1",
  // Network that your SCW supports. Currently this app only supports a single network, we will soon have support for multiple networks in future
  network: {
    chainID: "5",
    family: "EVM",
    name: "Goerli",
    provider: "https://goerli.infura.io/v3/bdabe9d2f9244005af0f566398e648da",
    entryPointAddress: "0x0F46c65C17AA6b4102046935F33301f0510B163A",
    bundler: "https://app.stackup.sh/api/v1/bundler/96771b1b09e802669c33a3fc50f517f0f514a40da6448e24640ecfd83263d336",
    baseAsset: {
      symbol: "ETH",
      name: "ETH",
      decimals: 18,
      image: "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp"
    }
  }
};
```

### Custom Network

1. Make sure EntryPoint is deployed on the target network.
2. Edit the `entryPointAddress` in `src/exconfig.ts`.
3. Add your network details in `hardhat.config.ts`.
4. Deploy the factory using `INFURA_ID=<required> npx hardhat deploy --network <network>`.
5. Edit the `factory_address` in `src/exconfig.ts`
6. Set `bundler` in `src/exconfig.ts` to a bundler that points to your network and accepts requests for your EntryPoint.
7. Run `yarn start`

### Local Network

1. Run a local hardhat node with `npx hardhat node` or use the node inside the bundler repo.
2. Deploy EntryPoint from [the account-abstraction repo](https://github.com/eth-infinitism/account-abstraction), you can find the instructions [below](#how-to-deploy-entrypoint-locally).
3. Edit the `entryPointAddress` in `src/exconfig.ts`.
4. Deploy the factory using `npx hardhat deploy --network localhost`.
5. Edit the `factory_address` in `src/exconfig.ts`
6. Start a local bunder from [the bundler repo](https://github.com/eth-infinitism/bundler), you can find the instructions [below](#how-to-run-bundler-locally).
7. Set `bundler` to `http://localhost:3000/rpc` in `src/exconfig.ts`.
8. Run `yarn start`

### How to deploy EntryPoint Locally

1. Clone the repo https://github.com/eth-infinitism/account-abstraction
2. Run `yarn install` to install the dependencies.
3. Deploy EntryPoint with `DEBUG=true MNEMONIC_FILE=<path-to-mnemonic-file> yarn deploy --network dev`

### How to run bundler Locally

1. Clone the repo https://github.com/eth-infinitism/bundler
2. Run `yarn install` to install the dependencies.
3. Run `yarn preprocess` to compile all the local dependencies.
4. Edit `bundler.config.json` at `packages/bundler/localconfig`:
   a. Edit `network` to your local hardhat node
   b. Edit the `entryPoint` address that you got while deploying it using instructions above.
   c. Make sure your mnemonic & beneficiary are setup correctly.
5. Run the bunder using `yarn bundler --unsafe --auto`

---

## Extension Structure

1. You can change the icons at `src/assets/img/icon-34.png` and `src/assets/img/icon-128.png` for the chrome extension.

## Wallet Structure

All your extension's account code must be placed in the `src/pages/Account` folder.

There are two subfolders in `src/pages/Account`:

- account-api
- components

### account-api folder

This folder is used to define the `AccountAPI` of your specific account implementation. Every implementation must implement `AccountApiType`.

```typescript
export abstract class AccountApiType extends BaseAccountAPI {
  abstract serialize: () => Promise<object>;

  /** sign a message for the user */
  abstract signMessage: (
    request?: MessageSigningRequest,
    context?: any
  ) => Promise<string>;

  /**
   * Called after the user is presented with the pre-transaction confirmation screen
   * The context passed to this method is the same as the one passed to the
   * onComplete method of the PreTransactionConfirmationComponent
   */
  async createUnsignedUserOpWithContext(
    info: TransactionDetailsForUserOp,
    preTransactionConfirmationContext?: any
  ): Promise<UserOperationStruct>;

  /**
   * Called after the user is presented with the post-transaction confirmation screen
   * The context passed to this method is the same as the one passed to the
   * onComplete method of the PostTransactionConfirmationComponent
   */
  abstract signUserOpWithContext(
    userOp: UserOperationStruct,
    postTransactionConfirmationContext?: any
  ): Promise<string>;
}

export declare abstract class BaseAccountAPI {
  /**
   * return the value to put into the "initCode" field, if the contract is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  abstract getAccountInitCode(): Promise<string>;
  /**
   * return current account's nonce.
   */
  abstract getNonce(): Promise<BigNumber>;
  /**
   * encode the call from entryPoint through our account to the target contract.
   * @param target
   * @param value
   * @param data
   */
  abstract encodeExecute(
    target: string,
    value: BigNumberish,
    data: string
  ): Promise<string>;
```

The boilerplate includes a SimpleAccount Implementation by Eth-Infinitism, which you can find [here](https://github.com/eth-infinitism/bundler/blob/main/packages/sdk/src/SimpleAccountAPI.ts).

### components folder

This folder is used to define the components that will be used in the Chrome extension. This folder should contain two subfolders.

- onboarding
- sign-message
- transaction

The `onboarding` folder defines the component that will be displayed to the user during the creation of a new wallet. You can display custom information or collect user inputs if needed.

The signature of the `OnboardingComponent` is defined as follows.

```typescript
export interface OnboardingComponentProps {
  onOnboardingComplete: (context?: any) => void;
}

export interface OnboardingComponent
  extends React.FC<OnboardingComponentProps> {}
```

Once the component has collected enough information from the user, it should pass the collected information to `onOnboardingComplete` as the `context` parameter. This `context` will be passed on to your `account-api`

The signature of the `account-api` is as follows, which shows how the `context` will be passed:

```typescript
export interface AccountApiParamsType extends BaseApiParams {
  context?: any;
}

export type AccountImplementationType = new (
  params: AccountApiParamsType
) => AccountApiType;
```

The `sign-message` folder defines the component that will be displayed to the user whenever the dapp requests the user to sign any message, i.e. dapp calls `personal_sign` RPC method. You can display custom information or collect user inputs if needed.

The signature of the `SignMessageComponenet` is defined as follows.

```typescript
export interface SignMessageComponenetProps {
  onComplete: (context?: any) => Promise<void>;
}

export interface SignMessageComponenet
  extends React.FC<SignMessageComponenetProps> {}
```

Once the component has collected enough information from the user, it should pass the collected information to `onComplete` as the `context` parameter. This `context` will be passed on to your `signMessage` function of `account-api`

The signature of the `signMessage` is as follows, which shows how the `context` will be passed:

```typescript
  /** sign a message for the user */
  abstract signMessage: (
    request?: MessageSigningRequest,
    context?: any
  ) => Promise<string>;
```

The `transaction` folder contains components that are displayed to the user whenever the Dapp requests to initiate a transaction by calling the `eth_sendTransaction` RPC method. These components can display custom information or gather necessary user inputs.

There are three key components involved in the transaction process:

- `PreTransactionConfirmationComponent`
- `TransactionConfirmationComponent`
- `PostTransactionConfirmationComponent`

The flow of these components' mounting and interaction is detailed below:

## Process Flow

1. **Dapp Initiates Transaction:** The Dapp calls `eth_sendTransaction`.

2. **Pre-Transaction Confirmation:** The `PreTransactionConfirmationComponent` is loaded. It can display any necessary information and also return a `context`.

3. **Unsigned User Operation Creation:** The `context` from the previous step is passed to the background `account-api` function `createUnsignedUserOpWithContext`. This function returns the unsigned user operation with paymaster and data. If the developer requires any specific parameters for the paymaster, they can be included in the `context` from Step 2, which is passed to `createUnsignedUserOpWithContext`.

4. **Transaction Confirmation:** The unsigned user operation is passed to the `TransactionConfirmationComponent`. This is the default transaction confirmation screen, but developers can now modify it as it is part of the `account-api` components. This component is also passed the `context` from Step 2 and can return a new `context`.

5. **Post-Transaction Confirmation:** The `PostTransactionConfirmationComponent` is then mounted with the `context` from Step 4. This is the stage where developers can request external signs after the transaction has been confirmed by the user (for example, in a two-owner setup, a rainbow is needed). This component also returns a `context` which will be passed to `account-api`.

6. **User Operation Signature:** After Step 5, `account-api` is called and the function `signUserOpWithContext` is executed, where the `context` from Step 5 is passed.

7. **User Operation Dispatch:** Once a signature is received from Step 6, the `userOp` is sent to the blockchain.

The signature of the `TransactionComponents` is defined as follows.

```typescript
export interface TransactionComponentProps {
  transaction: EthersTransactionRequest;
  onReject: () => Promise<void>;
}

export interface PreTransactionConfirmationtProps
  extends TransactionComponentProps {
  onComplete: (
    modifiedTransaction: EthersTransactionRequest,
    context?: any
  ) => Promise<void>;
}

export interface TransactionConfirmationtProps
  extends TransactionComponentProps {
  userOp: UserOperationStruct;
  context: any;
  onComplete: (context?: any) => Promise<void>;
}

export interface PostTransactionConfirmationtProps
  extends TransactionComponentProps {
  userOp: UserOperationStruct;
  context: any;
  onComplete: (context?: any) => Promise<void>;
}

export interface PreTransactionConfirmation
  extends React.FC<PreTransactionConfirmationtProps> {}

export interface TransactionConfirmation
  extends React.FC<TransactionConfirmationtProps> {}

export interface PostTransactionConfirmation
  extends React.FC<PostTransactionConfirmationtProps> {}
```

## FAQ

### Is the password screen mandatory?

No you can disable that by setting `enablePasswordEncryption` flag to `false` in `exconfig.ts`.

> **Warning:** the local storage will be unencrypted and your wallet must return an encrypted state when `serialize` function of `account-api` willo be called or else the user's fund will be at risk.

### Is the view transaction screen mandatory?

If you want to show a custom screen then you must present it to the user in `TransactionComponent` and set `showTransactionConfirmationScreen` to `false`.

### How do I, as a wallet provider attach a custom paymaster?

You must return the paymaster information in the `userOp` constructed by the function `createUnsignedUserOp`.

> **Warning:** If `showTransactionConfirmationScreen` has been disabled then the user will not be aware of paymaster and you must inform the user about paymaster in your custom transaction confirmation screen.

## Webpack auto-reload and HRM Errors

This repository is based on the boilerplate code found at [lxieyang/chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react). To understand how hot-reloading and content scripts work, refer to its README.

### LOGO Attributions

Designed by Tomo Saito, a designer and artist at the Ethereum Foundation. [@tomosaito](https://twitter.com/tomosaito)
