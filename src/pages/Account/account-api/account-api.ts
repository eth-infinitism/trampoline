import { BigNumber, BigNumberish, ethers, Wallet } from 'ethers';
import {
  SimpleAccount,
  SimpleAccountFactory,
  UserOperationStruct,
} from '@account-abstraction/contracts';

import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import config from '../../../exconfig';
import { SimpleAccountAPI } from '@account-abstraction/sdk';

const FACTORY_ADDRESS =
  config.factory_address || '0x6C583EE7f3a80cB53dDc4789B0Af1aaFf90e55F3';

/**
 * An implementation of the BaseAccountAPI using the SimpleAccount contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
class SimpleAccountTrampolineAPI
  extends SimpleAccountAPI
  implements AccountApiType
{
  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  factory?: SimpleAccountFactory;

  constructor(params: AccountApiParamsType<{}, { privateKey: string }>) {
    super({
      ...params,
      index: 0,
      owner: params.deserializeState?.privateKey
        ? new ethers.Wallet(params.deserializeState?.privateKey)
        : ethers.Wallet.createRandom(),
      factoryAddress: FACTORY_ADDRESS,
    });
  }

  serialize = async (): Promise<{ privateKey: string }> => {
    return {
      privateKey: (this.owner as Wallet).privateKey,
    };
  };

  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    throw new Error('signMessage method not implemented.');
  };

  async createUnsignedUserOpWithContext(
    info: TransactionDetailsForUserOp,
    preTransactionConfirmationContext?: any
  ): Promise<UserOperationStruct> {
    return {
      ...(await this.createUnsignedUserOp(info)),
      paymasterAndData: preTransactionConfirmationContext?.paymasterAndData
        ? preTransactionConfirmationContext?.paymasterAndData
        : '0x',
    };
  }

  signUserOpWithContext = async (
    userOp: UserOperationStruct,
    postTransactionConfirmationContext: any
  ): Promise<UserOperationStruct> => {
    return this.signUserOp(userOp);
  };
}

export default SimpleAccountTrampolineAPI;
