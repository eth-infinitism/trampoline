import { Contract, ethers } from 'ethers';
import { Wallet, Provider, utils, types } from 'zksync-web3';

import config from '../../../exconfig.json';
import { MessageSigningRequest } from '../../Background/redux-slices/signing';

// SimpleAccountFactory testnet address
const FACTORY_ADDRESS =
  config.factory_address || '0xC5ad16113d1C63d4459195e0ae78e15200fb19e0';

class SimpleAccountAPI {
  salt: string;

  owner: Wallet;

  provider: Provider;

  isDeployed: boolean;

  accountContract?: Contract;

  constructor() {
    this.isDeployed = false;

    this.provider = new Provider('https://zksync2-testnet.zksync.dev');
    this.owner = Wallet.createRandom().connect(this.provider);

    this.salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));
  }

  serialize = async (): Promise<object> => {
    return {
      privateKey: this.owner.privateKey,
    };
  };

  async deployAccount() {
    console.log('factory address', FACTORY_ADDRESS);

    const factoryContract = new ethers.Contract(
      FACTORY_ADDRESS,
      [
        {
          inputs: [
            {
              internalType: 'bytes32',
              name: '_salt',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: '_owner',
              type: 'address',
            },
          ],
          name: 'deployWallet',
          outputs: [
            {
              internalType: 'address',
              name: 'accountAddress',
              type: 'address',
            },
          ],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      this.owner
    );

    let deployTx = await factoryContract.populateTransaction.deployWallet(
      this.salt,
      this.owner.address
    );

    console.log('deploy tx ', deployTx);

    const paymasterInterface = new ethers.utils.Interface([
      'function general(bytes data)',
    ]);

    const gasLimit = await this.provider.estimateGas(deployTx);
    const gasPrice = await this.provider.getGasPrice();

    // prepare deploy transaction
    deployTx = {
      ...deployTx,
      from: this.owner.address,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      chainId: (await this.provider.getNetwork()).chainId,
      nonce: await this.provider.getTransactionCount(this.owner.address),
      type: 113,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams: {
          paymaster: FACTORY_ADDRESS,
          paymasterInput: paymasterInterface.encodeFunctionData('general', [
            [],
          ]),
        },
      } as types.Eip712Meta,
      value: ethers.BigNumber.from(0),
    };

    try {
      const sentTx = await this.owner.sendTransaction(deployTx);
      await sentTx;
      console.log('sending tx hash : ', sentTx.hash);
      const abiCoder = new ethers.utils.AbiCoder();
      const accountAddress = utils.create2Address(
        FACTORY_ADDRESS,
        '0x0100052da6738f04174ac75cf87cd271a0b9e5a267357e9d7cffa2bd9ce41896',
        this.salt,
        abiCoder.encode(['address'], [this.owner.address])
      );
      console.log('expected account address ', accountAddress);
      this.isDeployed = true;
      this.accountContract = new ethers.Contract(
        accountAddress,
        // abi here
        [],
        this.owner
      );
    } catch (e) {
      this.isDeployed = false;
      console.error('Error when deploying account. ', e);
    }
  }

  // async _getAccountContract(): Promise<SimpleAccount> {
  //   if (this.accountContract == null) {
  //     this.accountContract = SimpleAccount__factory.connect(
  //       await this.getAccountAddress(),
  //       this.provider
  //     );
  //   }
  //   return this.accountContract;
  // }

  getAccountAddress() {
    const abiCoder = new ethers.utils.AbiCoder();
    const accountAddress = utils.create2Address(
      FACTORY_ADDRESS,
      '0x0100052da6738f04174ac75cf87cd271a0b9e5a267357e9d7cffa2bd9ce41896',
      this.salt,
      abiCoder.encode(['address'], [this.owner.address])
    );

    return accountAddress;
  }

  async getNonce() {
    if (!this.accountContract) {
      return Error('account contract is not deployed');
    }

    return await this.provider.getTransactionCount(
      this.accountContract.address
    );
  }

  signMessage = async (
    context: any,
    request?: MessageSigningRequest
  ): Promise<string> => {
    return this.owner.signMessage(request?.rawSigningData || '');
  };
}

export default SimpleAccountAPI;
