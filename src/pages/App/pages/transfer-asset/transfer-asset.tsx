import {
  BoxProps,
  FormControl,
  FormGroup,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import React, { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../../components/header';
import { useBackgroundSelector } from '../../hooks';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import { Center } from '../../../../components/Center';
import { BorderBox } from '../../../../components/BorderBox';
import { HeadTitle } from '../../../../components/HeadTitle';
import { Button } from '../../../../components/Button';

type Props = BoxProps & {};

const TransferAsset: FC<Props> = ({ ...props }) => {
  const navigate = useNavigate();
  const [toAddress, setToAddress] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const activeAccount = useBackgroundSelector(getActiveAccount);

  const sendEth = useCallback(async () => {
    if (!ethers.utils.isAddress(toAddress)) {
      setError('Invalid to address');
      return;
    }
    setError('');

    if (window.ethereum) {
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: activeAccount,
            to: toAddress,
            data: '0x',
            value: ethers.utils.parseEther(value),
          },
        ],
      });
      console.log(txHash);
      navigate('/');
    }
  }, [activeAccount, navigate, toAddress, value]);

  return (
    <Center
      minHeight="100vh"
      height="100%"
      width="60%"
      marginX="auto"
      {...props}
    >
      <Header />
      <BorderBox>
        <HeadTitle marginBottom={4} title="Transfer ETH" />
        <FormGroup sx={{ width: '100%' }}>
          {/* To */}
          <FormControl
            sx={{ marginBottom: 2, width: '100%' }}
            variant="outlined"
          >
            <InputLabel htmlFor="password" sx={{ color: 'white' }}>
              Send to
            </InputLabel>
            <OutlinedInput
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              autoFocus
              label="Send to"
              sx={{ color: 'white', width: '100%' }}
            />
          </FormControl>
          {/* Value */}
          <FormControl
            sx={{ marginBottom: 2, width: '100%' }}
            variant="outlined"
          >
            <InputLabel
              htmlFor="password"
              sx={{ color: 'white' }}
              children="Value"
            />
            <OutlinedInput
              endAdornment={
                <InputAdornment
                  position="end"
                  sx={{ color: 'white' }}
                  children="ETH"
                />
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
              label="Value"
              sx={{ width: '100%' }}
            />
          </FormControl>
          {/* Error */}
          {error && (
            <Typography variant="body1" color="error" children={error} />
          )}

          <Button
            sx={{ marginLeft: 'auto', marginTop: 8 }}
            title="Send"
            onClick={sendEth}
            disabled={!toAddress}
          ></Button>
        </FormGroup>
      </BorderBox>
    </Center>
  );
};

export default TransferAsset;
