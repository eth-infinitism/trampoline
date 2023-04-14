import React, { useCallback } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { Button, Typography } from '@mui/material';
import { ethers } from 'ethers';

const TransferAssetButton = ({ activeAccount }: { activeAccount: string }) => {
  // const theme = useTheme();
  // const navigate = useNavigate();

  const sendToBob = useCallback(async () => {
    console.log('did we come here?', window.ethereum);
    if (window.ethereum) {
      // ポップアップ起動のため'eth_requestAccounts'のメッセージイベントでポップアップ起動している
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // 初期Transactionを作成
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
      console.log(txHash);
    }
  }, [activeAccount]);

  return (
    // onClick={() => navigate('/transfer-assets')}
    <Button size="large" variant="contained" onClick={sendToBob}>
      <Typography mr={1} p={1} variant="h6" color="white">
        Send to bob
      </Typography>
      <SendRoundedIcon sx={{ color: 'white' }} />
    </Button>
  );
};

export default TransferAssetButton;
