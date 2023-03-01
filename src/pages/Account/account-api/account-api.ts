import { BigNumber, BigNumberish, ethers } from 'ethers';
import { UserOperationStruct } from '@account-abstraction/contracts';
import { hexConcat } from 'ethers/lib/utils';

import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import { EthersTransactionRequest } from '../../Background/services/types';
import {
  WebauthnAccount,
  WebauthnAccountFactory,
  WebauthnAccountFactory__factory,
  WebauthnAccount__factory,
} from './typechain-types';

const FACTORY_ADDRESS = '0x52aeBE6d31478B24EdfC9ab1c1fFB9e23e37c744';

export type QValues = {
  credentialId: string;
  q0: string;
  q1: string;
};

/**
 * An implementation of the BaseAccountAPI using the SimpleAccount contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
class BLSAccountAPI extends AccountApiType {
  name: string;
  factoryAddress?: string;
  ec: string;
  q_values: QValues;
  index: number;

  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  accountContract?: WebauthnAccount;

  factory?: WebauthnAccountFactory;

  constructor(
    params: AccountApiParamsType<{
      q_values: QValues;
    }>
  ) {
    super(params);
    this.factoryAddress = FACTORY_ADDRESS;

    if (!params.context?.q_values) throw new Error('Need q_values');

    this.ec = '0x16367BB04F0Bb6D4fc89d2aa31c32E0ddA609508';
    this.q_values = params.context?.q_values;

    this.index = 0;
    this.name = 'SimpleAccountAPI';
  }

  serialize = async (): Promise<object> => {
    return {
      q_values: this.q_values,
    };
  };

  async _getAccountContract(): Promise<WebauthnAccount> {
    if (this.accountContract == null) {
      this.accountContract = WebauthnAccount__factory.connect(
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
        this.factory = WebauthnAccountFactory__factory.connect(
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
        this.ec,
        [this.q_values.q0, this.q_values.q1],
        this.index,
      ]),
    ]);
  }

  getUserOpHashToSign = async (transaction: EthersTransactionRequest) => {
    const userOp = await this.createUnsignedUserOp({
      target: transaction.to,
      data: transaction.data
        ? ethers.utils.hexConcat([transaction.data])
        : '0x',
      value: transaction.value,
      gasLimit: transaction.gasLimit,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    });
    return this.getUserOpHash(userOp);
  };

  getUserOpHashToSignAndCredentialId = async (
    transaction: EthersTransactionRequest
  ) => {
    return {
      credentialId: this.q_values.credentialId,
      userOpHash: await this.getUserOpHashToSign(transaction),
    };
  };

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
    // return await this.ownerOne.signMessage(arrayify(userOpHash));
    return '';
  }

  async signUserOpWithContext(
    userOp: UserOperationStruct,
    context: any
  ): Promise<UserOperationStruct> {
    const userOphash = await this.getUserOpHash(userOp);

    console.log(
      'q_values',
      JSON.stringify([this.q_values.q0, this.q_values.q1])
    );
    console.log('signature', JSON.stringify(context.signature));
    console.log('userOphash', userOphash);

    return {
      ...userOp,
      signature: ethers.utils.hexConcat(context.signature),
    };
  }

  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    // return this.ownerOne.signMessage(request?.rawSigningData || '');
    return '';
  };

  async createUnsignedUserOpForTransactions(
    transactions: TransactionDetailsForUserOp[]
  ): Promise<UserOperationStruct> {
    const accountContract = await this._getAccountContract();
    const callData = accountContract.interface.encodeFunctionData(
      'executeBatch',
      [
        transactions.map((transaction) => transaction.target),
        transactions.map((transaction) => transaction.data),
      ]
    );

    const callGasLimit = await this.provider.estimateGas({
      from: this.entryPointAddress,
      to: this.getAccountAddress(),
      data: callData,
    });

    const initCode = await this.getInitCode();

    const initGas = await this.estimateCreationGas(initCode);
    const verificationGasLimit = BigNumber.from(
      await this.getVerificationGasLimit()
    ).add(initGas);

    let maxFeePerGas, maxPriorityFeePerGas;

    const feeData = await this.provider.getFeeData();
    maxFeePerGas = feeData.maxFeePerGas ?? 0;
    maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 0;

    const partialUserOp: UserOperationStruct = {
      sender: await this.getAccountAddress(),
      nonce: this.getNonce(),
      initCode,
      callData,
      callGasLimit,
      verificationGasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymasterAndData: '',
      preVerificationGas: 0,
      signature: '',
    };

    return {
      ...partialUserOp,
      preVerificationGas: this.getPreVerificationGas(partialUserOp),
      signature: '',
    };
  }
}

export default BLSAccountAPI;