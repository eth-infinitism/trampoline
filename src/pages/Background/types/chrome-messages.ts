export const AllowedQueryParamPage = {
  signTransaction: '/sign-transaction',
  dappPermission: '/dapp-permission',
  signData: '/sign-data',
  personalSignData: '/personal-sign',
} as const;

export type AllowedQueryParamPageType =
  (typeof AllowedQueryParamPage)[keyof typeof AllowedQueryParamPage];
