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

import Config from '../../../exconfig';

const FACTORY_ADDRESS =
  Config.factory_address || '0xc8994CCc4F09524E6996648cb43622D9B82C5192';

export type QValues = {
  credentialId: string;
  authDataBuffer: string;
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
class WebAuthnAccountAPI extends AccountApiType {
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
      q_values: QValues | 'Denied';
    }>
  ) {
    super(params);
    this.factoryAddress = FACTORY_ADDRESS;

    const foundQValuesInDeserializedState = params.deserializeState?.q_values;
    const foundQValuesInContext =
      params.context?.q_values && params.context?.q_values !== 'Denied';

    if (!foundQValuesInDeserializedState && !foundQValuesInContext)
      throw new Error('Need q_values');

    this.ec = Config.eleptic_curve;
    this.q_values =
      params.context?.q_values || params.deserializeState.q_values;

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
        this.q_values.authDataBuffer,
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
    await userOp.preVerificationGas;
    await userOp.verificationGasLimit;
    console.log(userOp);
    return this.getUserOpHash({
      ...userOp,
      verificationGasLimit: Number(userOp.verificationGasLimit) * 4,
      preVerificationGas: 466360,
    });
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
    throw new Error("Shoudn't be called");
  }

  async signUserOpWithContext(
    userOp: UserOperationStruct,
    context: any
  ): Promise<UserOperationStruct> {
    await userOp.verificationGasLimit;
    return {
      ...userOp,
      verificationGasLimit: Number(userOp.verificationGasLimit) * 4,
      preVerificationGas: 466360,
      signature: ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'bytes'],
        [
          ethers.utils.hexConcat(context.signature),
          context.clientDataJSON,
          //   context.authDataBuffer,
        ]
      ),
    };
  }

  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    // return this.ownerOne.signMessage(request?.rawSigningData || '');
    return '';
  };
}

export default WebAuthnAccountAPI;
