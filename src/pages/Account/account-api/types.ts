import {
  BaseAccountAPI,
  BaseApiParams,
} from '@account-abstraction/sdk/dist/src/BaseAccountAPI';

export abstract class AccountApiType extends BaseAccountAPI {
  abstract serialize: () => Promise<object>;
}

export interface AccountApiParamsType extends BaseApiParams {
  context?: any;
}

export type AccountImplementationType = new (
  params: AccountApiParamsType
) => AccountApiType;
