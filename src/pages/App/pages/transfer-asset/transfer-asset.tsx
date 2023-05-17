import {
  Box,
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
  Stack,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import Header from '../../components/header';
import { ethers } from 'ethers';
import { useBackgroundSelector } from '../../hooks';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import { useNavigate } from 'react-router-dom';

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
          <Box
            component="div"
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.20)',
              position: 'relative',
            }}
          >
            <Typography variant="h6">Transfer Eth</Typography>
          </Box>
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <FormGroup sx={{ p: 2, pt: 4 }}>
              <FormControl sx={{ m: 1, width: 300 }} variant="outlined">
                <InputLabel htmlFor="password">Send to</InputLabel>
                <OutlinedInput
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  autoFocus
                  label="Send to"
                />
              </FormControl>
              <FormControl sx={{ m: 1, width: 300 }} variant="outlined">
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
                sx={{ mt: 4 }}
                size="large"
                variant="contained"
              >
                Send
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
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TransferAsset;
