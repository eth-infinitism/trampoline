import { UserOperationStruct } from '@account-abstraction/contracts';
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import {
  getAccountInfo,
  getActiveAccount,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import { selectCurrentOriginPermission } from '../../../Background/redux-slices/selectors/dappPermissionSelectors';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import {
  selectCurrentPendingSendTransactionRequest,
  selectCurrentPendingSendTransactionUserOp,
} from '../../../Background/redux-slices/selectors/transactionsSelectors';
import { createUnsignedUserOp } from '../../../Background/redux-slices/transactions';
import { EthersTransactionRequest } from '../../../Background/services/types';
import AccountInfo from '../../../Popup/components/account-info';
import OriginInfo from '../../../Popup/components/origin-info';
import useAccountApi from '../../useAccountApi';

const SignTransactionConfirmation = ({
  activeNetwork,
  activeAccount,
  accountInfo,
  originPermission,
  transactions,
  userOp,
  onReject,
  onSend,
}: {
  activeNetwork: any;
  activeAccount: any;
  accountInfo: any;
  originPermission: any;
  transactions: EthersTransactionRequest[];
  userOp: UserOperationStruct;
  onReject: any;
  onSend: any;
}) => {
  const [showAddPaymasterUI, setShowAddPaymasterUI] = useState<boolean>(false);
  const [addPaymasterLoader, setAddPaymasterLoader] = useState<boolean>(false);
  const [paymasterUrl, setPaymasterUrl] = useState<string>('');

  const addPaymaster = useCallback(async () => {
    // let newPaymasterUrl: string = paymasterUrl;
    // if (paymasterUrl[paymasterUrl.length - 1] !== '/')
    //   newPaymasterUrl = paymasterUrl + '/';

    // const response = await fetch(`${newPaymasterUrl}rpc/eth_g`);
    setAddPaymasterLoader(false);
    setShowAddPaymasterUI(false);
  }, []);

  const onSendClick = useCallback(() => {
    onSend();
  }, [onSend]);

  return (
    <Container>
      <Box sx={{ p: 2 }}>
        <Typography textAlign="center" variant="h6">
          Send transaction request
        </Typography>
      </Box>
      {activeAccount && (
        <AccountInfo activeAccount={activeAccount} accountInfo={accountInfo} />
      )}
      <Stack spacing={2} sx={{ position: 'relative', pt: 2, mb: 4 }}>
        <OriginInfo permission={originPermission} />
        <Typography variant="h6" sx-={{ p: 2 }}>
          Paymaster Info
        </Typography>
        {!showAddPaymasterUI && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">
              {userOp.paymasterAndData === '0x'
                ? 'No paymaster has been used'
                : ';'}
            </Typography>
            <Button onClick={() => setShowAddPaymasterUI(true)} variant="text">
              Add custom
            </Button>
          </Paper>
        )}
        {showAddPaymasterUI && (
          <Paper sx={{ p: 2 }}>
            <TextField
              value={paymasterUrl}
              onChange={(e) => setPaymasterUrl(e.target.value)}
              sx={{ width: '100%' }}
              label="Paymaster URL"
              variant="standard"
            />
            <Box
              justifyContent="space-around"
              alignItems="center"
              display="flex"
              sx={{ p: '16px 0px' }}
            >
              <Button
                sx={{ width: 150 }}
                variant="outlined"
                onClick={() => setShowAddPaymasterUI(false)}
              >
                Cancel
              </Button>
              <Button
                sx={{ width: 150, position: 'relative' }}
                variant="contained"
                onClick={addPaymaster}
              >
                Add
                {addPaymasterLoader && (
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
            </Box>
          </Paper>
        )}
        <Typography variant="h6" sx-={{ p: 2 }}>
          {transactions.length > 1 ? ' Transactions data' : 'Transaction data'}
        </Typography>
        <Stack spacing={2}>
          {transactions.map((transaction: EthersTransactionRequest) => (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                To:{' '}
                <Typography component="span" variant="body2">
                  <pre className="sign-message-pre-tag">{transaction.to}</pre>
                </Typography>
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Data:{' '}
                <Typography component="span" variant="body2">
                  <pre className="sign-message-pre-tag">
                    {transaction.data?.toString()}
                  </pre>
                </Typography>
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Value:{' '}
                <Typography component="span" variant="body2">
                  <pre className="sign-message-pre-tag">
                    {transaction.value
                      ? ethers.utils.formatEther(transaction.value)
                      : 0}{' '}
                    {activeNetwork.baseAsset.symbol}
                  </pre>
                </Typography>
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Stack>
      {!showAddPaymasterUI && (
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            width: '100%',
          }}
        >
          <Box
            justifyContent="space-around"
            alignItems="center"
            display="flex"
            sx={{ p: 2 }}
          >
            <Button sx={{ width: 150 }} variant="outlined" onClick={onReject}>
              Reject
            </Button>
            <Button
              sx={{ width: 150 }}
              variant="contained"
              onClick={onSendClick}
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

const Transaction = ({
  transaction,
  onComplete,
  onReject,
}: {
  transaction: EthersTransactionRequest;
  onComplete: (
    modifiedTransaction: EthersTransactionRequest,
    context: any
  ) => void;
  onReject: () => Promise<void>;
}) => {
  const [stage, setStage] = useState<'show-transaction' | 'awaiting-signature'>(
    'show-transaction'
  );
  const { result, loading, callAccountApi } = useAccountApi();

  const backgroundDispatch = useBackgroundDispatch();
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, activeAccount)
  );

  const sendTransactionRequest = useBackgroundSelector(
    selectCurrentPendingSendTransactionRequest
  );

  const pendingUserOp = useBackgroundSelector(
    selectCurrentPendingSendTransactionUserOp
  );

  useEffect(() => {
    if (activeAccount) {
      backgroundDispatch(createUnsignedUserOp(activeAccount));
    }
  }, [activeAccount, backgroundDispatch]);

  const originPermission = useBackgroundSelector((state) =>
    selectCurrentOriginPermission(state, {
      origin: sendTransactionRequest?.origin || '',
      address: activeAccount || '',
    })
  );

  useEffect(() => {
    const listenToMessageEvent = (
      { signature, clientDataJSON }: any,
      sender: any
    ) => {
      if (
        sender &&
        sender.url.includes('http://localhost:3000/iframe.html#/request-sign')
      ) {
        console.log(signature, 'signature');
        onComplete(transaction, { signature, clientDataJSON });
      }
    };

    window.addEventListener('message', listenToMessageEvent);

    chrome.runtime.onMessageExternal.addListener(listenToMessageEvent);

    return () =>
      chrome.runtime.onMessageExternal.removeListener(listenToMessageEvent);
  }, [onComplete, transaction]);

  useEffect(() => {
    callAccountApi('getUserOpHashToSignAndCredentialId', [transaction]);
  }, [callAccountApi, transaction]);

  const onSend = useCallback(() => {
    if (result) {
      window.open(
        `http://localhost:3000/iframe.html#/request-sign/${chrome.runtime.id}/${result.userOpHash}/${result.credentialId}`
      );
    }
  }, [result]);

  console.log(stage, pendingUserOp, sendTransactionRequest);
  if (
    stage === 'show-transaction' &&
    pendingUserOp &&
    sendTransactionRequest.transactionRequest
  )
    return (
      <SignTransactionConfirmation
        activeNetwork={activeNetwork}
        activeAccount={activeAccount}
        accountInfo={accountInfo}
        originPermission={originPermission}
        onReject={onReject}
        onSend={onSend}
        transactions={[sendTransactionRequest.transactionRequest]}
        userOp={pendingUserOp}
      />
    );

  return (
    <CardContent>
      {stage === 'awaiting-signature' ? (
        <Typography variant="h3" gutterBottom>
          Awaiting Signature
        </Typography>
      ) : null}
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