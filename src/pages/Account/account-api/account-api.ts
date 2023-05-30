import { constants, ethers, Wallet } from 'ethers';
import { UserOperationStruct } from '@account-abstraction/contracts';

import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import config from '../../../exconfig';
import { SimpleAccountAPI } from '@account-abstraction/sdk';
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

  createUnsignedUserOp = async (
    info: TransactionDetailsForUserOp
  ): Promise<UserOperationStruct> => {
    const userOp = await resolveProperties(
      await super.createUnsignedUserOp(info)
    );
    if (!this.erc20Paymaster) throw new Error('erc20Paymaster not initialized');
    const erc20PaymasterAndData =
      await this.erc20Paymaster.generatePaymasterAndData(userOp);
    return {
      ...userOp,
      preVerificationGas: ethers.BigNumber.from(userOp.preVerificationGas).gt(
        50000
      )
        ? userOp.preVerificationGas
        : ethers.BigNumber.from(50000).toHexString(),
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
    if (!this.erc20Paymaster) throw new Error('erc20Paymaster not initialized');

    const userOp = await resolveProperties(
      await this.createUnsignedUserOp(info)
    );

    // await this.erc20Paymaster.verifyTokenApproval(userOp);

    const erc20PaymasterAndData =
      await this.erc20Paymaster.generatePaymasterAndData(userOp);

    return {
      ...userOp,
      paymasterAndData: erc20PaymasterAndData ? erc20PaymasterAndData : '0x',
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
    console.log('signUserOpWithContext', userOp);
    return this.signUserOp(userOp);
  };
}

export default SimpleAccountTrampolineAPI;
