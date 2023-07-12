import { ethers, Wallet } from 'ethers';
import { UserOperationStruct } from '@account-abstraction/contracts';

import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import config from '../../../exconfig';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
import { resolveProperties } from 'ethers/lib/utils.js';

const FACTORY_ADDRESS = config.factory_address;

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
  paymasterRPC?: ethers.providers.JsonRpcProvider;

  /**
   *
   * We create a new private key or use the one provided in the
   * deserializeState and initialize the SimpleAccountAPI
   */
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

  async init(): Promise<this> {
    this.paymasterRPC = new ethers.providers.JsonRpcProvider(
      config.paymaster_url,
      {
        name: 'Paymaster',
        chainId: (await this.provider.getNetwork()).chainId,
      }
    );

    return this;
  }

  /**
   *
   * @returns the serialized state of the account that is saved in
   * the secured vault in localstorage and later passed to the
   * constructor in the deserializeState parameter
   */
  serialize = async (): Promise<{ privateKey: string }> => {
    return {
      privateKey: (this.owner as Wallet).privateKey,
    };
  };

  /**
   * Called when the Dapp requests eth_signTypedData
   */
  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    throw new Error('signMessage method not implemented.');
  };

  dummySignUserOp = (userOp: UserOperationStruct): UserOperationStruct => {
    return Object.assign(Object.assign({}, userOp), {
      signature:
        '0xe8fe34b166b64d118dccf44c7198648127bf8a76a48a042862321af6058026d276ca6abb4ed4b60ea265d1e57e33840d7466de75e13f072bbd3b7e64387eebfe1b',
    });
  };

  /**
   * Called after the user is presented with the pre-transaction confirmation screen
   * The context passed to this method is the same as the one passed to the
   * onComplete method of the PreTransactionConfirmationComponent
   */
  async createUnsignedUserOpWithContext(
    info: TransactionDetailsForUserOp,
    preTransactionConfirmationContext?: any
  ): Promise<UserOperationStruct> {
    if (!this.paymasterRPC) throw new Error('paymasterRPC not initialized');

    const userOp = await resolveProperties(
      await this.createUnsignedUserOp(info)
    );

    userOp.nonce = ethers.BigNumber.from(userOp.nonce).toHexString();
    userOp.callGasLimit = ethers.BigNumber.from(
      userOp.callGasLimit
    ).toHexString();
    userOp.verificationGasLimit = ethers.BigNumber.from(
      userOp.verificationGasLimit
    ).toHexString();
    userOp.preVerificationGas = ethers.BigNumber.from(
      userOp.preVerificationGas
    ).toHexString();
    userOp.maxFeePerGas = ethers.BigNumber.from(
      userOp.maxFeePerGas
    ).toHexString();
    userOp.maxPriorityFeePerGas = ethers.BigNumber.from(
      userOp.maxPriorityFeePerGas
    ).toHexString();

    const paymasterData: {
      callGasLimit: string;
      paymasterAndData: string;
      preVerificationGas: string;
      verificationGasLimit: string;
    } = await this.paymasterRPC.send('local_getPaymasterAndData', [
      await resolveProperties(this.dummySignUserOp(userOp)),
      config.network.entryPointAddress,
    ]);

    console.log('paymasterData', paymasterData);

    return {
      ...(await this.createUnsignedUserOp(info)),
      ...paymasterData,
    };
  }

  /**
   * Callled after the user has accepted the transaction on the transaction confirmation screen
   * The context passed to this method is the same as the one passed to the
   * onComplete method of the TransactionConfirmationComponent
   */
  signUserOpWithContext = async (
    userOp: UserOperationStruct,
    postTransactionConfirmationContext: any
  ): Promise<UserOperationStruct> => {
    return this.signUserOp(userOp);
  };
}

export default SimpleAccountTrampolineAPI;
