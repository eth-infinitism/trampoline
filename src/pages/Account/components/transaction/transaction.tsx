import {
  Button,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { Provider } from 'zksync-web3';
import { EthersTransactionRequest } from '../../../Background/services/provider-bridge';
import { TransactionComponentProps } from '../types';

// TODO: display tx information here as well as the paymaster if available.. and benefit if available aslo
const Transaction = ({
  transaction,
  onComplete,
  onReject,
}: TransactionComponentProps) => {
  console.log('transaction', transaction);

  return (
    <>
      <CardContent
      // sx={{
      //   background: 'red',
      // }}
      >
        <Typography variant="h3" gutterBottom>
          Dummy Account Component
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <div>Transaction</div>
          <p>
            <div>Transaction info</div>
            <div>
              <div>from : {transaction.from}</div>
              <div>to : {transaction.to}</div>
              <div>calldata : {transaction.data}</div>
              <div>value : {transaction.value}</div>
            </div>

            <div>Membership info</div>
            <div>
              <div>Tier 1</div>
              <div>Gas fee discount</div>
            </div>

            <hr />

            <div>gas fee </div>

            <button
              onClick={async () => {
                const provider = new Provider(
                  'https://zksync2-testnet.zksync.dev'
                );

                const tx = {
                  ...transaction,
                  from: '0x11e5132f1c5aA04faeFdFD525CA04abe1A1Fec4F',
                };

                try {
                  const res = await provider.estimateGas(tx);
                  console.log('estiamte fee', res);
                } catch (e) {
                  console.log('eeror estiamte', e);
                }
              }}
            >
              estimate
            </button>
          </p>
        </Typography>
      </CardContent>
      <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Button
            size="large"
            variant="contained"
            onClick={() => onComplete(transaction, undefined)}
          >
            Continue
          </Button>
        </Stack>
      </CardActions>
    </>
  );
};

// function getUserTier(provider: Provider) {
//   try {
//     const tier = provider;
//   } catch (e) {}
// }

export default Transaction;
