import {
  Button,
  CardActions,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { EthersTransactionRequest } from '../../../Background/services/provider-bridge';
import useAccountApi from '../../useAccountApi';
import { TransactionComponentProps } from '../types';

const Transaction = ({
  transaction,
  onComplete,
}: TransactionComponentProps) => {
  const { connect, connectors, isLoading, error, pendingConnector } =
    useConnect();

  const { result, loading, callAccountApi } = useAccountApi();

  const { isConnected } = useAccount();

  const { data, signMessage } = useSignMessage({
    onSuccess(data, variables) {
      // Verify signature when sign message succeeds
      console.log(data, variables);
    },
  });

  useEffect(() => {
    console.log('result------', result, loading);
  }, [result, loading]);

  useEffect(() => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    } else {
      callAccountApi('getUserOpHashToSign');
      //   signMessage({ message: 'Ye karke dikhao' });
    }
  }, [isConnected, connect, connectors, callAccountApi]);

  return !isConnected ? (
    <>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Connect 2FA Device
        </Typography>
        <Typography variant="body1" color="text.secondary">
          All your transactions must be signed by your mobile wallet and this
          chrome extension to prevent fraudulant transactions.
          <br />
        </Typography>
      </CardContent>
      <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          {connectors.map((connector) => (
            <Button
              size="large"
              variant="contained"
              disabled={!connector.ready}
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              {connector.name}
              {!connector.ready && ' (unsupported)'}
              {isLoading &&
                connector.id === pendingConnector?.id &&
                ' (connecting)'}
            </Button>
          ))}

          {error && <Typography>{error.message}</Typography>}
        </Stack>
      </CardActions>
    </>
  ) : (
    <CardContent>
      <Typography variant="h3" gutterBottom>
        Awaiting Signature
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Check your phone, a signature request has been sent for the transaction.
        <br />
      </Typography>
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
    </CardContent>
  );
};

export default Transaction;
