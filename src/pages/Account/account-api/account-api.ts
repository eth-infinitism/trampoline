import { BigNumber, BigNumberish, ethers, Wallet } from 'ethers';
import {
  SimpleAccount,
  SimpleAccount__factory,
  SimpleAccountFactory,
  SimpleAccountFactory__factory,
} from '@account-abstraction/contracts';
import { arrayify, hexConcat } from 'ethers/lib/utils';

import { AccountApiParamsType, AccountApiType } from './types';

const FACTORY_ADDRESS = '0x2C1adA574f72562d9dc3fF50f374f092e24fC3b4';

/**
 * An implementation of the BaseAccountAPI using the SimpleAccount contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
class SimpleAccountAPI extends AccountApiType {
  name: string;
  factoryAddress?: string;
  owner: Wallet;
  index: number;

  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  accountContract?: SimpleAccount;

  factory?: SimpleAccountFactory;

  constructor(params: AccountApiParamsType) {
    super(params);
    this.factoryAddress = FACTORY_ADDRESS;
    this.owner = params.context.privateKey
      ? new ethers.Wallet(params.context.privateKey)
      : ethers.Wallet.createRandom();
    this.index = 0;
    this.name = 'SimpleAccountAPI';
  }

  serialize = async (): Promise<object> => {
    return {
      privateKey: this.owner.privateKey,
    };
  };

  async _getAccountContract(): Promise<SimpleAccount> {
    if (this.accountContract == null) {
      this.accountContract = SimpleAccount__factory.connect(
        await this.getAccountAddress(),
        this.provider
      );
    }
    return this.accountContract;
  }

  /**
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== '') {
        this.factory = SimpleAccountFactory__factory.connect(
          this.factoryAddress,
          this.provider
        );
      } else {
        throw new Error('no factory to get initCode');
      }
    }
    return hexConcat([
      this.factory.address,
      this.factory.interface.encodeFunctionData('createAccount', [
        await this.owner.getAddress(),
        this.index,
      ]),
    ]);
  }

  async getNonce(): Promise<BigNumber> {
    if (await this.checkAccountPhantom()) {
      return BigNumber.from(0);
    }
    const accountContract = await this._getAccountContract();
    return await accountContract.nonce();
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
    const accountContract = await this._getAccountContract();
    return accountContract.interface.encodeFunctionData('execute', [
      target,
      value,
      data,
    ]);
  }

  async signUserOpHash(userOpHash: string): Promise<string> {
    return await this.owner.signMessage(arrayify(userOpHash));
  }
}

export default SimpleAccountAPI;
