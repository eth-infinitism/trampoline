import { Typography, Chip, Tooltip } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import {
  AccountData,
  getAccountData,
} from '../../../Background/redux-slices/account';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { getAccountEVMData } from '../../../Background/redux-slices/selectors/accountSelectors';
import { Center } from '../../../../components/Center';

const AccountBalanceInfo = ({ address }: { address: string }) => {
  const navigate = useNavigate();
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountData: AccountData | 'loading' = useBackgroundSelector((state) =>
    getAccountEVMData(state, { address, chainId: activeNetwork.chainID })
  );

  const walletDeployed: boolean = useMemo(
    () => (accountData === 'loading' ? false : accountData.accountDeployed),
    [accountData]
  );

  const backgroundDispatch = useBackgroundDispatch();

  useEffect(() => {
    backgroundDispatch(getAccountData(address));
    // console.log({ activeNetwork });
  }, [backgroundDispatch, address]);

  if (!activeNetwork) {
    return <></>;
  }

  return (
    <Center>
      {activeNetwork.baseAsset.image && (
        <img
          height={60}
          src={activeNetwork.baseAsset.image}
          alt={`${activeNetwork.baseAsset.name} asset logo`}
        />
      )}
      {accountData !== 'loading' &&
        accountData.balances &&
        accountData.balances[activeNetwork.baseAsset.symbol] && (
          <Typography marginY={2} variant="h3" noWrap>
            {
              accountData.balances[activeNetwork.baseAsset.symbol].assetAmount
                .amount
            }{' '}
            {activeNetwork.baseAsset.symbol}
          </Typography>
        )}
      <Tooltip
        title={
          walletDeployed
            ? `Wallet has been deployed on ${activeNetwork.name} chain`
            : `Wallet is not deployed on ${activeNetwork.name} chain, it will be deployed upon the first transaction`
        }
      >
        <Chip
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/deploy-account')}
          variant="outlined"
          color={walletDeployed ? 'success' : 'error'}
          size="small"
          icon={walletDeployed ? <CheckCircleIcon /> : <CancelIcon />}
          label={
            accountData === 'loading'
              ? 'Loading deployment status...'
              : walletDeployed
              ? 'Deployed'
              : 'Not deployed'
          }
        />
      </Tooltip>
    </Center>
  );
};

export default AccountBalanceInfo;
