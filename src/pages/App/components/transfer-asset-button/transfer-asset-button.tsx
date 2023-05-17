import React, { useCallback } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import StoreIcon from '@mui/icons-material/Store';
import { Avatar, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const TransferAssetButton = ({ activeAccount }: { activeAccount: string }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const sendMoney = useCallback(async () => {
    // if (window.ethereum) {
    //   const accounts = await window.ethereum.request({
    //     method: 'eth_requestAccounts',
    //   });
    //   const txHash = await window.ethereum.request({
    //     method: 'eth_sendTransaction',
    //     params: [
    //       {
    //         from: activeAccount,
    //         to: ethers.constants.AddressZero,
    //         data: '0x',
    //       },
    //     ],
    //   });
    //   console.log(txHash);
    // }
  }, [activeAccount]);

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
