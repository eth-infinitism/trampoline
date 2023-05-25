import { BigNumber, BigNumberish, ethers, Wallet } from 'ethers';
import {
  SimpleAccount,
  SimpleAccount__factory,
  SimpleAccountFactory,
  SimpleAccountFactory__factory,
  UserOperationStruct,
} from '@account-abstraction/contracts';
import { arrayify, hexConcat } from 'ethers/lib/utils';

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
class SimpleAccountTrampolineAPI extends AccountApiType {
  factoryAddress?: string;
  owner: Wallet;
  index: number;

  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  simpleAccountApiInstance: SimpleAccountAPI;

  factory?: SimpleAccountFactory;

  constructor(params: AccountApiParamsType<{}, { privateKey: string }>) {
    super(params);
    this.factoryAddress = FACTORY_ADDRESS;

    this.owner = params.deserializeState?.privateKey
      ? new ethers.Wallet(params.deserializeState?.privateKey)
      : ethers.Wallet.createRandom();
    this.index = 0;

    this.simpleAccountApiInstance = new SimpleAccountAPI({
      provider: this.provider,
      owner: this.owner,
      factoryAddress: this.factoryAddress,
      entryPointAddress: params.entryPointAddress,
      index: this.index,
    });
  }

  serialize = async (): Promise<{ privateKey: string }> => {
    return {
      privateKey: this.owner.privateKey,
    };
  };

  async _getAccountContract(): Promise<SimpleAccount> {
    return this.simpleAccountApiInstance._getAccountContract();
  }

  /**
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode(): Promise<string> {
    return this.simpleAccountApiInstance.getAccountInitCode();
  }

  async getNonce(): Promise<BigNumber> {
    return this.simpleAccountApiInstance.getNonce();
  }

  /**
   * encode a method call from entryPoint to our contract
   * @param target
   * @param value
   * @param data
   */
  async encodeExecute(
    target: string,
    value: BigNumberish,
    data: string
  ): Promise<string> {
    return this.simpleAccountApiInstance.encodeExecute(target, value, data);
  }
  async signUserOpHash(userOpHash: string): Promise<string> {
    return this.simpleAccountApiInstance.signUserOpHash(userOpHash);
  }

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
      ...(await this.simpleAccountApiInstance.createUnsignedUserOp(info)),
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
