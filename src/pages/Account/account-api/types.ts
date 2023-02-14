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
    context: any,
    request?: MessageSigningRequest
  ) => Promise<string>;

  /**
   * create a UserOperation, filling all details (except signature)
   * - if account is not yet created, add initCode to deploy it.
   * - if gas or nonce are missing, read them from the chain (note that we can't fill gaslimit before the account is created)
   * @param info
   */
  abstract createUnsignedUserOpForTransactions(
    info: TransactionDetailsForUserOp[]
  ): Promise<UserOperationStruct>;
}

export interface AccountApiParamsType extends BaseApiParams {
  context?: any;
  deserializeState?: any;
}

export type AccountImplementationType = new (
  params: AccountApiParamsType
) => AccountApiType;
