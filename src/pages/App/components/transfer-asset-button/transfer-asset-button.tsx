import React, { FC } from 'react';
import { ButtonProps, Stack } from '@mui/material';
import WalletIcon from '@mui/icons-material/Wallet';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { useNavigate } from 'react-router-dom';
import { MainButton } from '../../../../components/MainButton';
import { colors } from '../../../../config/const';

type Props = ButtonProps & {
  activeAccount: string;
};

const TransferAssetButton: FC<Props> = ({ activeAccount }) => {
  const navigate = useNavigate();

  // const sendToBob = useCallback(async () => {
  //   console.log('did we come here?', window.ethereum);
  //   if (window.ethereum) {
  //     // ポップアップ起動のため'eth_requestAccounts'のメッセージイベントでポップアップ起動している
  //     await window.ethereum.request({ method: 'eth_requestAccounts' });
  //     // 初期Transactionを作成
  //     const txHash = await window.ethereum.request({
  //       method: 'eth_sendTransaction',
  //       params: [
  //         {
  //           from: activeAccount,
  //           to: ethers.constants.AddressZero,
  //           data: '0x',
  //         },
  //       ],
  //     });
  //     console.log(txHash);
  //   }
  // }, [activeAccount]);

  return (
    <Stack direction="row" spacing={2} width="100%">
      <MainButton
        title="Buy Crypt"
        icon={<WalletIcon sx={{ color: colors.dark }} />}
      />
      <MainButton
        title="Send"
        onClick={() => navigate('/transfer-assets')}
        icon={<SendRoundedIcon sx={{ color: colors.dark }} />}
        // onClick={sendToBob}
      />
      <MainButton
        title="Swap"
        icon={<ChangeCircleIcon sx={{ color: colors.dark }} />}
      />
    </Stack>
  );
};

export default TransferAssetButton;
