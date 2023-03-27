import {
  Box,
  Button,
  CardActions,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import React, { useCallback } from 'react';
import { Greeter } from '../../account-api/typechain-types';

const GreetApp = () => {
  const sendTransaction = useCallback(async () => {
    const accounts =
      window.ethereum &&
      (await window.ethereum.request({
        method: 'eth_requestAccounts',
      }));
    console.log(accounts);

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          data: '0xead710c4000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000045465737400000000000000000000000000000000000000000000000000000000',
        },
      ],
    });

    console.log(accounts, txHash);
  }, []);

  return (
    <Container sx={{ height: '100vh' }}>
      <Stack
        spacing={2}
        sx={{ height: '100%' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box
          component="span"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: 600,
            p: 2,
            border: '1px solid #d6d9dc',
            borderRadius: 5,
            background: 'white',
          }}
        >
          <CardContent>
            <Typography textAlign="center" variant="h3" gutterBottom>
              Greet contract demo
            </Typography>
            <Typography
              textAlign="center"
              variant="body1"
              color="text.secondary"
            >
              Demo contract to show test transaction locally.
            </Typography>
          </CardContent>
          <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Button
                size="large"
                variant="contained"
                onClick={sendTransaction}
              >
                Send Transaction
              </Button>
            </Stack>
          </CardActions>
        </Box>
      </Stack>
    </Container>
  );
};

export default GreetApp;
