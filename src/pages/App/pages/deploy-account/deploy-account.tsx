import {
  Box,
  CircularProgress,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { getAccountData } from '../../../Background/redux-slices/account';
import {
  getAccountEVMData,
  getActiveAccount,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import AccountBalanceInfo from '../../components/account-balance-info';
import AccountInfo from '../../components/account-info';
import Header from '../../components/header';
import { useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { useProvider } from 'wagmi';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Center } from '../../../../components/Center';
import { BorderBox } from '../../../../components/BorderBox';
import { Button } from '../../../../components/Button';

const DeployAccount = () => {
  const navigate = useNavigate();
  const [deployLoader, setDeployLoader] = useState<boolean>(false);
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const provider = useProvider();
  const accountData = useBackgroundSelector((state) =>
    getAccountEVMData(state, {
      chainId: activeNetwork.chainID,
      address: activeAccount || '',
    })
  );

  const walletDeployed: boolean = useMemo(
    () => (accountData === 'loading' ? false : accountData.accountDeployed),
    [accountData]
  );

  useEffect(() => {
    if (walletDeployed) {
      alert('Account already deployed');
      navigate('/');
    }
  }, [navigate, walletDeployed]);

  const backgroundDispatch = useBackgroundDispatch();

  const [minimumRequiredFundsPrice, setMinimumRequiredFundsPrice] =
    useState<BigNumber>(BigNumber.from(0));

  useEffect(() => {
    const fetchMinimumRequiredFundsPrice = async () => {
      if (accountData !== 'loading') {
        const gasPrice = await provider.getGasPrice();

        setMinimumRequiredFundsPrice(
          ethers.utils
            .parseEther(accountData.minimumRequiredFunds)
            .mul(gasPrice)
            .add(ethers.utils.parseEther('0.001'))
        );
      }
    };
    fetchMinimumRequiredFundsPrice();
  }, [accountData, provider]);

  let isButtonDisabled = useMemo(() => {
    if (accountData === 'loading') return true;
    if (!accountData.balances) return true;
    if (
      ethers.utils
        .parseEther(
          accountData.balances[activeNetwork.baseAsset.symbol].assetAmount
            .amount
        )
        .lte(minimumRequiredFundsPrice)
    )
      return true;
    return false;
  }, [accountData, activeNetwork, minimumRequiredFundsPrice]);

  useEffect(() => {
    if (!isButtonDisabled) return;
    const timer = setInterval(() => {
      if (activeAccount) backgroundDispatch(getAccountData(activeAccount));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAccount, backgroundDispatch, isButtonDisabled]);

  const deployAcount = useCallback(async () => {
    if (!activeAccount) return;
    setDeployLoader(true);

    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: activeAccount,
            to: ethers.constants.AddressZero,
            data: '0x',
          },
        ],
      });

      console.log(accounts, txHash);
      alert('success');
      navigate('/');
    }

    // await backgroundDispatch(sendTransaction(activeAccount));
  }, [activeAccount, navigate]);

  return (
    <Center minHeight="100vh" height="100%" width="60%" marginX="auto">
      <Header />
      {activeAccount && (
        <AccountInfo mb={2} showOptions={false} address={activeAccount} />
      )}
      {activeAccount && <AccountBalanceInfo mb={2} address={activeAccount} />}
      {/* Deplot account */}
      <BorderBox>
        <Typography variant="h6" children="Perform the following steps:" />
        <Stepper activeStep={isButtonDisabled ? 0 : 1} orientation="vertical">
          <Step key={0}>
            <StepLabel optional={null} children="Transfer Funds" />
            <StepContent>
              <Typography mb={1}>
                Transfer more than{' '}
                <Typography component="span">
                  {ethers.utils.formatEther(minimumRequiredFundsPrice)}{' '}
                  {activeNetwork.baseAsset.symbol}
                </Typography>{' '}
                to the account
              </Typography>
              <Button title="Copy address" />
            </StepContent>
          </Step>
          <Step key={1}>
            <StepLabel optional={null} children="Initiate Deploy Transaction" />
            <StepContent>
              <Typography
                children="Initiate the deployment transaction, it may take some time for
                the transaction to be added to the blockchain."
              />
              <Box sx={{ mb: 2 }}>
                <Button
                  disabled={deployLoader}
                  onClick={deployAcount}
                  variant="contained"
                  sx={{ mt: 1, mr: 1, position: 'relative' }}
                >
                  Deploy Account
                  {deployLoader && (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  )}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </BorderBox>
    </Center>
  );
};

export default DeployAccount;
