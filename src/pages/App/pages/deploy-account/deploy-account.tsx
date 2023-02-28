import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Container,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Tooltip,
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
import {
  sendTransaction,
  sendTransactionsRequest,
} from '../../../Background/redux-slices/transactions';

const DeployAccount = () => {
  const [deployLoader, setDeployLoader] = useState<boolean>(false);
  const [tooltipMessage, setTooltipMessage] = useState<string>('Copy address');
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const provider = useProvider();
  const accountData = useBackgroundSelector((state) =>
    getAccountEVMData(state, {
      chainId: activeNetwork.chainID,
      address: activeAccount || '',
    })
  );

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
            .add(ethers.utils.parseEther('0.001')) // TODO: read from config
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

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(activeAccount || '');
    setTooltipMessage('Address copied');
    setTimeout(() => {
      setTooltipMessage('Copy address');
    }, 6000);
  }, [activeAccount]);

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
    }

    // await backgroundDispatch(sendTransaction(activeAccount));
  }, [backgroundDispatch, activeAccount]);

  return (
    <Container sx={{ width: '62vw', height: '100vh' }}>
      <Header />
      <Card sx={{ ml: 4, mr: 4, mt: 2, mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography textAlign="center" variant="h6">
            Account not deployed
          </Typography>
        </Box>
        {activeAccount && (
          <AccountInfo showOptions={false} address={activeAccount} />
        )}
        {activeAccount && <AccountBalanceInfo address={activeAccount} />}
        <Box sx={{ m: 4 }}>
          <Typography variant="h6">Perform the following steps:</Typography>
          <Stepper activeStep={isButtonDisabled ? 0 : 1} orientation="vertical">
            <Step key={0}>
              <StepLabel optional={null}>Transfer Funds</StepLabel>
              <StepContent>
                <Typography>
                  Transfer more than{' '}
                  <Typography component={'span'}>
                    {ethers.utils.formatEther(minimumRequiredFundsPrice)}{' '}
                    {activeNetwork.baseAsset.symbol}
                  </Typography>{' '}
                  to the account
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Tooltip title={tooltipMessage} enterDelay={0}>
                    <Button
                      onClick={copyAddress}
                      variant="contained"
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Copy address
                    </Button>
                  </Tooltip>
                </Box>
              </StepContent>
            </Step>
            <Step key={1}>
              <StepLabel optional={null}>Initiate Deploy Transaction</StepLabel>
              <StepContent>
                <Typography>
                  Initiate the deployment transaction, it may take some time for
                  the transaction to be added to the blockchain.
                </Typography>
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
        </Box>
      </Card>
    </Container>
  );
};

export default DeployAccount;
