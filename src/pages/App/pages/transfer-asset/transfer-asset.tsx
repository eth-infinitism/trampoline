import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormGroup,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../../components/header';
import { useBackgroundSelector } from '../../hooks';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import { Center } from '../../../../components/Center';

const TransferAsset = () => {
  const navigate = useNavigate();
  const [toAddress, setToAddress] = React.useState<string>('');
  const [value, setValue] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const [loader, setLoader] = React.useState<boolean>(false);

  const sendEth = useCallback(async () => {
    if (!ethers.utils.isAddress(toAddress)) {
      setError('Invalid to address');
      return;
    }
    setLoader(true);
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
    setLoader(false);
  }, [activeAccount, navigate, toAddress, value]);

  return (
    <Container sx={{ width: '62vw', height: '100vh' }}>
      <Header />
      <Card sx={{ ml: 4, mr: 4, mt: 2, mb: 2 }}>
        <CardContent>
          <Center sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.20)' }}>
            <Typography variant="h6">Transfer ETH</Typography>
          </Center>
          <Center sx={{ marginY: 8 }}>
            <FormGroup>
              <FormControl
                sx={{ marginBottom: 2, width: 300 }}
                variant="outlined"
              >
                <InputLabel htmlFor="password">Send to</InputLabel>
                <OutlinedInput
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  autoFocus
                  label="Send to"
                />
              </FormControl>
              <FormControl
                sx={{ marginBottom: 2, width: 300 }}
                variant="outlined"
              >
                <InputLabel htmlFor="password">Value</InputLabel>
                <OutlinedInput
                  endAdornment={
                    <InputAdornment position="end">ETH</InputAdornment>
                  }
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  label="Value"
                />
              </FormControl>
              <Typography variant="body1" color="error">
                {error}
              </Typography>

              <Button
                disabled={loader}
                onClick={sendEth}
                size="large"
                variant="contained"
              >
                Send
                <SendRoundedIcon sx={{ marginLeft: 2, color: 'white' }} />
                {loader && (
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
            </FormGroup>
          </Center>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TransferAsset;
