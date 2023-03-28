import React from 'react';
import * as zksync from 'zksync-web3';
import { Provider, types, utils } from 'zksync-web3';
import { ethers } from 'ethers';
import { useContract } from 'wagmi';
import axios from 'axios';
import accountABI from './SimpleAccount.json';
import { walletFactoryAbi } from '../service/walletFactory';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RecoveryPage = () => {
  const [email, setEmail] = React.useState<string>('');
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const zkSyncProvider = new zksync.Provider(
    'https://zksync2-testnet.zksync.dev'
  );
  const ethereumProvider = ethers.getDefaultProvider('goerli');
  const wallet1 = new zksync.Wallet(
    privateKey,
    zkSyncProvider,
    ethereumProvider
  );

  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const createWalletContract = useContract({
    address: '0xC5ad16113d1C63d4459195e0ae78e15200fb19e0',
    abi: walletFactoryAbi,
    signerOrProvider: zkSyncProvider,
  });

  // const contract = useContract({
  //   address: '',
  //   abi: accountABI.abi,
  //   signerOrProvider: wallet1,
  // });

  // const handleclick2 = async () => {
  //   console.log();
  //   const res = await axios.post(
  //     'http://localhost:8000/api/wallet/guardian-signature',
  //     { email: 'abc@gmail.com', message: 'hi' }
  //   );
  //   console.log(res.data);
  //   const signature = res.data.signature;
  //   const contractAddr = new ethers.Contract(
  //     re.contractAddress,
  //     accountABI.abi,
  //     wallet1
  //   );
  // };

  const handleCLick = async () => {
    try {
      console.log(wallet1);
      const salt = ethers.constants.HashZero;
      const factoryContract = new ethers.Contract(
        '0x950630d37c0f535E672536DC493b76C5F6cB3B65',
        walletFactoryAbi,
        wallet1
      );
      let deployTx = await factoryContract.populateTransaction.deployWallet(
        salt,
        [wallet.address]
      );
      const paymasterInterface = new ethers.utils.Interface([
        'function general(bytes data)',
      ]);

      const gasLimit = await zkSyncProvider.estimateGas(deployTx);
      const gasPrice = await zkSyncProvider.getGasPrice();
      // Creating transaction that utilizes paymaster feature
      deployTx = {
        ...deployTx,
        from: wallet1.address,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        chainId: (await zkSyncProvider.getNetwork()).chainId,
        nonce: await zkSyncProvider.getTransactionCount(wallet1.address),
        type: 113,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: {
            paymaster: factoryContract.address,
            paymasterInput: paymasterInterface.encodeFunctionData('general', [
              [],
            ]),
          },
        } as types.Eip712Meta,
        value: ethers.BigNumber.from(0),
      };
      const signer = wallet1.provider.getSigner();
      const sentTx = await wallet1.sendTransaction(deployTx);
      const re = await sentTx.wait();
      console.log(await zkSyncProvider.getTransactionCount(wallet1.address));
      console.log(re.contractAddress);
      const contractAddr = new ethers.Contract(
        re.contractAddress,
        accountABI.abi,
        wallet1
      );
      console.log(re.contractAddress);
      const resp = await axios.post(
        'http://localhost:8000/api/wallet/set-recovery',
        { email: 'abc@gmail.com', contractAddress: re.contractAddress }
      );
      const guardian = resp.data.guardianAddress;
      console.log(guardian);
      console.log(await zkSyncProvider.getTransactionCount(re.contractAddress));
      let setRecovery =
        await contractAddr?.populateTransaction.setRecoveryGuardian(guardian);
      setRecovery = {
        ...setRecovery,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        chainId: (await zkSyncProvider.getNetwork()).chainId,
        nonce: (await zkSyncProvider.getTransactionCount(wallet1.address)) + 1,
        type: 113,
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: {
            paymaster: factoryContract.address,
            paymasterInput: paymasterInterface.encodeFunctionData('general', [
              [],
            ]),
          },
        } as types.Eip712Meta,
        value: ethers.BigNumber.from(0),
      };
      const waitTx = await wallet1.sendTransaction(setRecovery);
      console.log(waitTx);
      if (waitTx) {
        navigate('/');
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ m: 2 }}
    >
      <h1>Recovery</h1>
      <p>Enter Email for Recovery</p>
      <input className="input" onChange={handleChange} />
      <Button variant="contained" className="button" onClick={handleCLick}>
        Recover
      </Button>
      {/* <Button variant="contained" className="button" onClick={handleclick2}>
        Recover wallet
      </Button> */}
    </Box>
  );
};

export default RecoveryPage;
