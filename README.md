# EIP-4337 Account Abstraction Demonstration Using a Chrome Extension Boilerplate with React 18 and Webpack 5

<img src="src/assets/img/icon-128.png" width="64"/>

This project is a tool designed to help people write SCW (Smart Contract Wallet)
code and present it in hackathons without worrying about the wallet
infrastructure. With our boilerplate, you can quickly try out your SCW and test
it with a few dapps to have real-world transactions.

Please note that our tool is not intended for production use. Instead, it is
designed to help you quickly and easily test your SCW code with real-world
scenarios. This can be especially helpful when participating in hackathons or
other events where you need to demonstrate your SCW in action.

## Installation and Running

### Steps:

1. Verify that your [Node.js](https://nodejs.org/) version is >= **18**.
2. Clone this repository.
3. Update the name, description, and repository fields in package.json.
4. Change the name of your extension in `src/manifest.json`.
5. Run `yarn install` to install the dependencies.
6. Run `yarn start`
7. Load your extension in Chrome by following these steps:
   1. Go to `chrome://extensions/`
   2. Enable `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
8. Happy hacking.

## Structure

All your extension's account code must be placed in the `src/pages/Account`
folder.

There are two subfolders in `src/pages/Account`:

- account-api
- components

### account-api folder

This folder is used to define the `AccountAPI` of your specific account
implementation. Every implementation must implement `AccountApiType`.

```typescript
export abstract class AccountApiType extends BaseAccountAPI {
  abstract serialize: () => Promise<object>;

  /** sign a message for the user */
  abstract signMessage: (
    request?: MessageSigningRequest,
    context?: any,
  ) => Promise<string>;

  abstract createUnsignedUserOp(
    info: TransactionDetailsForUserOp,
    context?: any,
  ): Promise<UserOperationStruct>;
}

export declare abstract class BaseAccountAPI {
  private senderAddress;
  private isPhantom;
  private readonly entryPointView;
  provider: Provider;
  overheads?: Partial<GasOverheads>;
  entryPointAddress: string;
  accountAddress?: string;
  paymasterAPI?: PaymasterAPI;
  /**
   * base constructor.
   * subclass SHOULD add parameters that define the owner (signer) of this wallet
   */
  protected constructor(params: BaseApiParams);
  init(): Promise<this>;
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
    data: string,
  ): Promise<string>;
  /**
   * sign a userOp's hash (userOpHash).
   * @param userOpHash
   */
  abstract signUserOpHash(userOpHash: string): Promise<string>;
  /**
   * check if the contract is already deployed.
   */
  checkAccountPhantom(): Promise<boolean>;
  /**
   * calculate the account address even before it is deployed
   */
  getCounterFactualAddress(): Promise<string>;
  /**
   * return initCode value to into the UserOp.
   * (either deployment code, or empty hex if contract already deployed)
   */
  getInitCode(): Promise<string>;
  /**
   * return maximum gas used for verification.
   * NOTE: createUnsignedUserOp will add to this value the cost of creation, if the contract is not yet created.
   */
  getVerificationGasLimit(): Promise<BigNumberish>;
  /**
   * should cover cost of putting calldata on-chain, and some overhead.
   * actual overhead depends on the expected bundle size
   */
  getPreVerificationGas(userOp: Partial<UserOperationStruct>): Promise<number>;
  /**
   * ABI-encode a user operation. used for calldata cost estimation
   */
  packUserOp(userOp: NotPromise<UserOperationStruct>): string;
  encodeUserOpCallDataAndGasLimit(
    detailsForUserOp: TransactionDetailsForUserOp,
  ): Promise<{
    callData: string;
    callGasLimit: BigNumber;
  }>;
  /**
   * return userOpHash for signing.
   * This value matches entryPoint.getUserOpHash (calculated off-chain, to avoid a view call)
   * @param userOp userOperation, (signature field ignored)
   */
  getUserOpHash(userOp: UserOperationStruct): Promise<string>;
  /**
   * return the account's address.
   * this value is valid even before deploying the contract.
   */
  getAccountAddress(): Promise<string>;
  estimateCreationGas(initCode?: string): Promise<BigNumberish>;
  /**
   * create a UserOperation, filling all details (except signature)
   * - if account is not yet created, add initCode to deploy it.
   * - if gas or nonce are missing, read them from the chain (note that we can't fill gaslimit before the account is created)
   * @param info
   */
  createUnsignedUserOp(
    info: TransactionDetailsForUserOp,
  ): Promise<UserOperationStruct>;
  /**
   * Sign the filled userOp.
   * @param userOp the UserOperation to sign (with signature field ignored)
   */
  signUserOp(userOp: UserOperationStruct): Promise<UserOperationStruct>;
  /**
   * helper method: create and sign a user operation.
   * @param info transaction details for the userOp
   */
  createSignedUserOp(
    info: TransactionDetailsForUserOp,
  ): Promise<UserOperationStruct>;
  /**
   * get the transaction that has this userOpHash mined, or null if not found
   * @param userOpHash returned by sendUserOpToBundler (or by getUserOpHash..)
   * @param timeout stop waiting after this timeout
   * @param interval time to wait between polls.
   * @return the transactionHash this userOp was mined, or null if not found.
   */
  getUserOpReceipt(
    userOpHash: string,
    timeout?: number,
    interval?: number,
  ): Promise<string | null>;
}
```

The boilerplate includes a SimpleAccountImplementation by Eth-Infinitism, which
you can find
[here](https://github.com/eth-infinitism/bundler/blob/main/packages/sdk/src/SimpleAccountAPI.ts).

### components folder

This folder is used to define the components that will be used in the Chrome
extension. This folder should contain two subfolders.

- onboarding
- sign-message
- transaction

The `onboarding` folder defines the component that will be displayed to the user
during the creation of a new wallet. You can display custom information or
collect user inputs if needed.

The signature of the `OnboardingComponent` is defined as follows.

```typescript
export interface OnboardingComponentProps {
  onOnboardingComplete: (context?: any) => void;
}

export interface OnboardingComponent
  extends React.FC<OnboardingComponentProps> {}
```

Once the component has collected enough information from the user, it should
pass the collected information to `onOnboardingComplete` as the `context`
parameter. This `context` will be passed on to your `account-api`

The signature of the `account-api` is as follows, which shows how the `context`
will be passed:

```typescript
export interface AccountApiParamsType extends BaseApiParams {
  context?: any;
}

export type AccountImplementationType = new (
  params: AccountApiParamsType,
) => AccountApiType;
```

The `sign-message` folder defines the component that will be displayed to the
user whenever the dapp requests the user to sign any message, i.e. dapp calls
`personal_sign` RPC method. You can display custom information or collect user
inputs if needed.

The signature of the `SignMessageComponenet` is defined as follows.

```typescript
export interface SignMessageComponenetProps {
  onComplete: (context?: any) => Promise<void>;
}

export interface SignMessageComponenet
  extends React.FC<SignMessageComponenetProps> {}
```

Once the component has collected enough information from the user, it should
pass the collected information to `onComplete` as the `context` parameter. This
`context` will be passed on to your `signMessage` function of `account-api`

The signature of the `signMessage` is as follows, which shows how the `context`
will be passed:

```typescript
/** sign a message for the user */
abstract signMessage: (
  request?: MessageSigningRequest,
  context?: any
) => Promise<string>;
```

The `transaction` folder defines the component that will be displayed to the
user whenever the dapp requests to initiate a transaction, i.e. dapp calls
`eth_sendTransaction` RPC method. You can display custom information or collect
user inputs if needed.

The signature of the `TransactionComponent` is defined as follows.

```typescript
export interface TransactionComponentProps {
  transaction: EthersTransactionRequest;
  onComplete: (
    modifiedTransaction: EthersTransactionRequest,
    context?: any,
  ) => Promise<void>;
}

export interface TransactionComponent
  extends React.FC<TransactionComponentProps> {}
```

Once the component has collected enough information from the user, it should
pass the collected information to `onComplete` as the `context` parameter. You
can also modify the transaction if you want and return it also as a parameter of
`onComplete` function. This `context` and `modifiedTransaction` will be passed
on to your `createUnsignedUserOp` function of `account-api`

The signature of the `createUnsignedUserOp` is as follows, which shows how the
`context` will be passed:

```typescript
/** sign a message for the user */
abstract createUnsignedUserOp: (
  request?: MessageSigningRequest,
  context?: any
) => Promise<string>;
```

If you want you can also attach a paymaster here if your wallet wants to sponsor
the transaction as well. The paymaster information will be displayed to the
user.

## Config

Config of the extension can be set in `excnfig.json` file.

```json
{
  // Enable or disable password for the user.
  "enablePasswordEncryption": true,
  // Show default transaction screen
  "showTransactionConfirmationScreen": true,
  // Network that your SCW supports. Currently this app only supports a single network, we will soon have support for multiple networks in future
  "network": {
    "chainID": "5",
    "family": "EVM",
    "name": "Goerli",
    "provider": "https://goerli.infura.io/v3/bdabe9d2f9244005af0f566398e648da",
    "entryPointAddress": "0x0F46c65C17AA6b4102046935F33301f0510B163A",
    "bundler": "https://app.stackup.sh/api/v1/bundler/96771b1b09e802669c33a3fc50f517f0f514a40da6448e24640ecfd83263d336",
    "baseAsset": {
      "symbol": "ETH",
      "name": "ETH",
      "decimals": 18,
      "image": "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp"
    }
  }
}
```

## FAQ

### Is the password screen mandatory?

No you can disable that by setting `enablePasswordEncryption` flag to `false` in
`exconfig.json`.

> **Warning:** the local storage will be unencrypted and your wallet must return
> an encrypted state when `serialize` function of `account-api` willo be called
> or else the user's fund will be at risk.

### Is the view transaction screen mandatory?

If you want to show a custom screen then you must present it to the user in
`TransactionComponent` and set `showTransactionConfirmationScreen` to `false`.

### Where do I provide

This repository is based on the boilerplate code found at
[lxieyang/chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react).
To understand how hot-reloading and content scripts work, refer to its README.
