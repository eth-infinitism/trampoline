# EIP-4337 Account Abstraction Demonstration Using a Chrome Extension Boilerplate with React 18 and Webpack 5

<img src="src/assets/img/icon-128.png" width="64"/>

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

All your extension's account code must be placed in the `src/pages/Account` folder.

There are two subfolders in `src/pages/Account`:

- account-api
- components

### account-api folder

This folder is used to define the `BaseAccountAPI` of your specific account implementation. The boilerplate includes a SimpleAccountImplementation by Eth-Infinitism, which you can find [here](https://github.com/eth-infinitism/bundler/blob/main/packages/sdk/src/SimpleAccountAPI.ts).

### components folder

This folder is used to define the components that will be used in the Chrome extension. This folder should contain two subfolders.

- onboarding
- transaction

The `onboarding` folder defines the component that will be displayed to the user during the creation of a new wallet. You can display custom information or collect user inputs if needed.

The signature of the `OnboardingComponent` is defined as follows.

```
export interface OnboardingComponentProps {
  onOnboardingComplete: (context?: any) => void;
}

export interface OnboardingComponent
  extends React.FC<OnboardingComponentProps> {}
```

Once the component has collected enough information from the user, it should pass the collected information to `onOnboardingComplete` as the `context` parameter. This `context` will be passed on to your `account-api`

The signature of the `account-api` is as follows, which shows how the `context` will be passed:

```
export interface AccountApiParamsType extends BaseApiParams {
  context?: any;
}

export type AccountImplementationType = new (
  params: AccountApiParamsType
) => AccountApiType;
```

## Webpack auto-reload and HRM

This repository is based on the boilerplate code found at [lxieyang/chrome-extension-boilerplate-react](https://github.com/lxieyang/chrome-extension-boilerplate-react). To understand how hot-reloading and content scripts work, refer to its README.
