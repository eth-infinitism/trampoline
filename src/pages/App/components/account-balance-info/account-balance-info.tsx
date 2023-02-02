import { Stack, Typography, Chip } from '@mui/material';
import React from 'react';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundSelector } from '../../hooks';
import CancelIcon from '@mui/icons-material/Cancel';

const AccountBalanceInfo = () => {
  const activeNetwork = useBackgroundSelector(getActiveNetwork);

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
      <Chip
        variant="outlined"
        color="error"
        size="small"
        icon={<CancelIcon />}
        label="Not deployed"
      />
    </Stack>
  );
};

export default AccountBalanceInfo;
