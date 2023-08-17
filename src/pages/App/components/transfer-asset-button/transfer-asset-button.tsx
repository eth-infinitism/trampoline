import React, { useCallback } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StoreIcon from '@mui/icons-material/Store';
import { Avatar, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useNavigate } from 'react-router-dom';

const TransferAssetButton = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Stack direction={'row'} spacing={4}>
      <Tooltip title="Coming soon">
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={'4px'}
          sx={{ cursor: 'not-allowed', opacity: 0.5 }}
        >
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <StoreIcon />
          </Avatar>
          <Typography variant="button">Buy</Typography>
        </Stack>
      </Tooltip>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={'4px'}
        sx={{ cursor: 'pointer' }}
      >
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          <SendRoundedIcon
            onClick={() => navigate('/transfer-assets')}
            sx={{ transform: 'rotate(-45deg)', ml: '4px', mb: '6px' }}
          />
        </Avatar>
        <Typography variant="button">Send</Typography>
      </Stack>
      <Tooltip title="Coming soon">
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={'4px'}
          sx={{ cursor: 'not-allowed', opacity: 0.5 }}
        >
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <SwapHorizIcon />
          </Avatar>
          <Typography variant="button">Swap</Typography>
        </Stack>
      </Tooltip>
    </Stack>
  );
};

export default TransferAssetButton;
