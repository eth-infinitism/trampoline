import { constants, ethers, Wallet } from 'ethers';
import { UserOperationStruct } from '@account-abstraction/contracts';

import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import config from '../../../exconfig';
import { HttpRpcClient, SimpleAccountAPI } from '@account-abstraction/sdk';
import { hexConcat, resolveProperties } from 'ethers/lib/utils.js';
import {
  ERC20__factory,
  ERC20Paymaster,
  getERC20Paymaster,
} from '@pimlico/erc20-paymaster';
import {
  SimpleAccountWithPaymasterFactory,
  SimpleAccountWithPaymasterFactory__factory,
} from './typechain-types';
import { NotPromise } from '@account-abstraction/utils';

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
  factoryWithPaymaster?: SimpleAccountWithPaymasterFactory;
  erc20Paymaster?: ERC20Paymaster;
  bundler: HttpRpcClient;

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
    this.bundler = params.bundler;
  }

  async init(): Promise<this> {
    this.erc20Paymaster = await getERC20Paymaster(this.provider, 'USDC');
    return super.init();
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
   * return the value to put into the "initCode" field, if the account is not yet deployed.
   * this value holds the "factory" address, followed by this account's information
   */
  async getAccountInitCode() {
    if (this.factoryAddress === undefined)
      throw new Error('no factory to get initCode');

    if (!this.erc20Paymaster) throw new Error('erc20Paymaster not initialized');

    if (this.factoryWithPaymaster == null) {
      this.factoryWithPaymaster =
        SimpleAccountWithPaymasterFactory__factory.connect(
          this.factoryAddress,
          this.provider
        );
    }

    const usdcTokenAddress = await this.erc20Paymaster.contract.token();
    const usdcToken = ERC20__factory.connect(usdcTokenAddress, this.owner);
    const erc20PaymasterAddress = this.erc20Paymaster.contract.address;

    const approveData = usdcToken.interface.encodeFunctionData('approve', [
      erc20PaymasterAddress,
      constants.MaxUint256,
    ]);

    return hexConcat([
      this.factoryWithPaymaster.address,
      this.factoryWithPaymaster.interface.encodeFunctionData('createAccount', [
        await this.owner.getAddress(),
        this.index,
        usdcToken.address,
        0,
        approveData,
      ]),
    ]);
  }

  /**
   * Called when the Dapp requests eth_signTypedData
   */
  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    throw new Error('signMessage method not implemented.');
  };

  adjustGasParameters = async (
    userOp: NotPromise<UserOperationStruct>
  ): Promise<NotPromise<UserOperationStruct>> => {
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
    )
      .toHexString()
      .toLowerCase();

    console.log('yaha p to h');
    const gasParameters = await this.bundler.estimateUserOpGas(
      await this.signUserOp(userOp)
    );

    console.log(this.bundler, gasParameters);

    const estimatedGasLimit = ethers.BigNumber.from(
      gasParameters?.callGasLimit
    );
    const estimateVerificationGasLimit = ethers.BigNumber.from(
      gasParameters?.verificationGas
    );
    const estimatePreVerificationGas = ethers.BigNumber.from(
      gasParameters?.preVerificationGas
    );

    userOp.callGasLimit = estimatedGasLimit.gt(
      ethers.BigNumber.from(userOp.callGasLimit)
    )
      ? estimatedGasLimit.toHexString()
      : userOp.callGasLimit;

    userOp.verificationGasLimit = estimateVerificationGasLimit.gt(
      ethers.BigNumber.from(userOp.verificationGasLimit)
    )
      ? estimateVerificationGasLimit.toHexString()
      : userOp.verificationGasLimit;

    userOp.preVerificationGas = estimatePreVerificationGas.gt(
      ethers.BigNumber.from(userOp.preVerificationGas)
    )
      ? estimatePreVerificationGas.toHexString()
      : userOp.preVerificationGas;

    return userOp;
  };

  createUnsignedUserOp = async (
    info: TransactionDetailsForUserOp
  ): Promise<UserOperationStruct> => {
    const userOp = await resolveProperties(
      await super.createUnsignedUserOp(info)
    );
    // preVerificationGas predictions doesn't work properly on Mumbai network
    userOp.preVerificationGas = ethers.BigNumber.from(
      userOp.preVerificationGas
    ).gt(50000)
      ? userOp.preVerificationGas
      : ethers.BigNumber.from(50000).toHexString();

    if (!this.erc20Paymaster) throw new Error('erc20Paymaster not initialized');
    const erc20PaymasterAndData =
      await this.erc20Paymaster.generatePaymasterAndData(
        await this.adjustGasParameters(userOp)
      );
    return {
      ...userOp,
      paymasterAndData: erc20PaymasterAndData ? erc20PaymasterAndData : '0x',
    };
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
    return this.createUnsignedUserOp(info);
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
