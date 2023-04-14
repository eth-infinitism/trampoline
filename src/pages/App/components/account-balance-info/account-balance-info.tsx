import { Typography, Chip, Tooltip, BoxProps } from '@mui/material';
import React, { FC, useEffect, useMemo } from 'react';
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
import { BorderBox } from '../../../../components/BorderBox';
import { Row } from '../../../../components/Row';

type Props = BoxProps & {
  address: string;
};

const AccountBalanceInfo: FC<Props> = ({ address, ...props }) => {
  const navigate = useNavigate();
  const backgroundDispatch = useBackgroundDispatch();
  //
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountData: AccountData | 'loading' = useBackgroundSelector((state) =>
    getAccountEVMData(state, { address, chainId: activeNetwork.chainID })
  );
  const walletDeployed: boolean = useMemo(
    () => (accountData === 'loading' ? false : accountData.accountDeployed),
    [accountData]
  );

  useEffect(() => {
    backgroundDispatch(getAccountData(address));
    // console.log({ activeNetwork });
  }, [backgroundDispatch, address]);

  if (!activeNetwork) {
    return <></>;
  }

  return (
    <BorderBox py={2} {...props}>
      <Typography marginBottom={6} fontSize="32px" variant="h6">
        Balance
      </Typography>
      {/* ETH image */}
      {/* {activeNetwork.baseAsset.image && (
        <img
          height={60}
          src={activeNetwork.baseAsset.image}
          alt={`${activeNetwork.baseAsset.name} asset logo`}
        />
      )} */}
      {/* deploy */}
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
      {/* ETH */}
      {accountData !== 'loading' &&
        accountData.balances &&
        accountData.balances[activeNetwork.baseAsset.symbol] && (
          <Row>
            <Typography
              marginY={0}
              marginRight={1}
              fontSize="42px"
              fontWeight="bold"
              variant="h6"
              noWrap
            >
              {
                accountData.balances[activeNetwork.baseAsset.symbol].assetAmount
                  .amount
              }
            </Typography>
            <Typography marginY={0} fontSize="36px" variant="h6">
              {activeNetwork.baseAsset.symbol}
            </Typography>
          </Row>
        )}
    </BorderBox>
  );
};

export default AccountBalanceInfo;
