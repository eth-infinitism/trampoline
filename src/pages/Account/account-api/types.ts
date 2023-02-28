import { UserOperationStruct } from '@account-abstraction/contracts';
import {
  BaseAccountAPI,
  BaseApiParams,
} from '@account-abstraction/sdk/dist/src/BaseAccountAPI';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';

export abstract class AccountApiType extends BaseAccountAPI {
  abstract serialize: () => Promise<object>;

  /** sign a message for the use */
  abstract signMessage: (
    request?: MessageSigningRequest,
    context?: any
  ) => Promise<string>;

  abstract signUserOpWithContext(
    userOp: UserOperationStruct,
    context?: any
  ): Promise<UserOperationStruct>;
}

export interface AccountApiParamsType<T> extends BaseApiParams {
  context?: T;
  deserializeState?: any;
}

export type AccountImplementationType = new (
  params: AccountApiParamsType<any>
) => AccountApiType;
