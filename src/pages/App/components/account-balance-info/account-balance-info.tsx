import { Stack, Typography, Chip, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundSelector } from '../../hooks';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getProvider } from '@wagmi/core';

const AccountBalanceInfo = ({ address }: { address: string }) => {
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const [walletDeployed, setWalletDeployed] = useState<boolean>(false);

  const provider = getProvider();

  useEffect(() => {
    provider.getCode(address).then((code) => {
      if (code !== '0x') setWalletDeployed(true);
    });
  }, [provider, address, setWalletDeployed]);

  return (
    <Stack spacing={1} justifyContent="center" alignItems="center">
      {activeNetwork.baseAsset.image && (
        <img
          height={40}
          src={activeNetwork.baseAsset.image}
          alt={`${activeNetwork.baseAsset.name} asset logo`}
        />
      )}
      <Typography variant="h3">0 ETH</Typography>
      <Tooltip
        title={
          walletDeployed
            ? `Wallet has been deployed on ${activeNetwork.name} chain`
            : `Wallet is not deployed on ${activeNetwork.name} chain, it will be deployed upon the first transaction`
        }
      >
        <Chip
          variant="outlined"
          color={walletDeployed ? 'success' : 'error'}
          size="small"
          icon={walletDeployed ? <CheckCircleIcon /> : <CancelIcon />}
          label={walletDeployed ? 'Deployed' : 'Not deployed'}
        />
      </Tooltip>
    </Stack>
  );
};

export default AccountBalanceInfo;
