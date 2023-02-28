import { BigNumber, BigNumberish, ethers, Wallet } from 'ethers';
import {
  SimpleAccount,
  SimpleAccount__factory,
  SimpleAccountFactory,
  SimpleAccountFactory__factory,
  UserOperationStruct,
} from '@account-abstraction/contracts';
import { arrayify, hexConcat } from 'ethers/lib/utils';
import Config from '../../../exconfig.json';
import { AccountApiParamsType, AccountApiType } from './types';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';
import { TransactionDetailsForUserOp } from '@account-abstraction/sdk/dist/src/TransactionDetailsForUserOp';
import {
  TwoOwnerAccount,
  TwoOwnerAccountFactory,
  TwoOwnerAccountFactory__factory,
  TwoOwnerAccount__factory,
} from './typechain-types';

const FACTORY_ADDRESS =
  Config.factory_address || '0x6c0ec05Ad55C8B8427119ce50b6087E7B0C9c23e';

/**
 * An implementation of the BaseAccountAPI using the SimpleAccount contract.
 * - contract deployer gets "entrypoint", "owner" addresses and "index" nonce
 * - owner signs requests using normal "Ethereum Signed Message" (ether's signer.signMessage())
 * - nonce method is "nonce()"
 * - execute method is "execFromEntryPoint()"
 */
class TwoOwnerAccountAPI extends AccountApiType {
  name: string;
  factoryAddress?: string;
  ownerOne: Wallet;
  ownerTwo: string;
  index: number;

  /**
   * our account contract.
   * should support the "execFromEntryPoint" and "nonce" methods
   */
  accountContract?: TwoOwnerAccount;

  factory?: TwoOwnerAccountFactory;

  constructor(params: AccountApiParamsType<{ address: string }>) {
    super(params);
    this.factoryAddress = FACTORY_ADDRESS;

    params.deserializeState = {
      privateKey:
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    };

    this.ownerOne = params.deserializeState?.privateKey
      ? new ethers.Wallet(params.deserializeState?.privateKey)
      : ethers.Wallet.createRandom();

    this.ownerTwo = params.context?.address || '';
    this.index = 0;
    this.name = 'SimpleAccountAPI';
  }

  serialize = async (): Promise<object> => {
    return {
      privateKey: this.ownerOne.privateKey,
      ownerTwo: this.ownerTwo,
    };
  };

  async _getAccountContract(): Promise<TwoOwnerAccount> {
    if (this.accountContract == null) {
      this.accountContract = TwoOwnerAccount__factory.connect(
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
        this.factory = TwoOwnerAccountFactory__factory.connect(
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
        await this.ownerOne.getAddress(),
        this.ownerTwo,
        this.index,
      ]),
    ]);
  }

  getUserOpHashToSign = async (userOp: UserOperationStruct) => {
    return this.getUserOpHash(userOp);
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
    return await this.ownerOne.signMessage(arrayify(userOpHash));
  }

  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    return this.ownerOne.signMessage(request?.rawSigningData || '');
  };

  signUserOpWithContext = async (
    userOp: UserOperationStruct,
    context: { signedMessage: string }
  ): Promise<UserOperationStruct> => {
    // TODO get signature in cotext and append it

    console.log('ownerOne=', await this.ownerOne.getAddress());
    console.log('ownerTwo=', this.ownerTwo);
    console.log('UserOpHash=', await this.getUserOpHash(userOp));
    console.log(
      'signature=',
      ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'bytes'],
        [
          await this.signUserOpHash(await this.getUserOpHash(userOp)),
          context.signedMessage,
        ]
      )
    );

    return {
      ...userOp,
      signature: ethers.utils.defaultAbiCoder.encode(
        ['bytes', 'bytes'],
        [
          await this.signUserOpHash(await this.getUserOpHash(userOp)),
          context.signedMessage,
        ]
      ),
    };
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

export default TwoOwnerAccountAPI;