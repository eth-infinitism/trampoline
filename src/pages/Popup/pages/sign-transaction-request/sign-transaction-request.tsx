import { UserOperationStruct } from '@account-abstraction/contracts';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BigNumber, ethers } from 'ethers';
import React, { useCallback, useState } from 'react';
import {
  AccountImplementations,
  ActiveAccountImplementation,
} from '../../../App/constants';
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
  selectCurrentPendingModifiedSendTransactionRequest,
  selectCurrentPendingSendTransactionRequest,
  selectCurrentPendingSendTransactionUserOp,
} from '../../../Background/redux-slices/selectors/transactionsSelectors';
import {
  createUnsignedUserOp,
  rejectTransaction,
  sendTransaction,
} from '../../../Background/redux-slices/transactions';
import { EthersTransactionRequest } from '../../../Background/services/types';
import { setModifyTransactionRequest } from '../../../Background/redux-slices/transactions';

const SignTransactionComponent =
  AccountImplementations[ActiveAccountImplementation].Transaction;

const SignTransactionRequest = () => {
  const [stage, setStage] = useState<{
    stage:
      | 'pre-transaction-confirmation'
      | 'transaction-confirmation'
      | 'post-transaction-confirmation';
    context?: any;
  }>({
    stage: 'pre-transaction-confirmation',
  });

  const backgroundDispatch = useBackgroundDispatch();
  const activeAccount = useBackgroundSelector(getActiveAccount);

  const sendTransactionRequest = useBackgroundSelector(
    selectCurrentPendingSendTransactionRequest
  );

  const sendModiefiedTransactionRequest = useBackgroundSelector(
    selectCurrentPendingModifiedSendTransactionRequest
  );

  const pendingUserOp = useBackgroundSelector(
    selectCurrentPendingSendTransactionUserOp
  );

  const onSend = useCallback(
    async (context?: any) => {
      if (activeAccount)
        await backgroundDispatch(
          sendTransaction({
            address: activeAccount,
            context,
          })
        );
      window.close();
    },
    [activeAccount, backgroundDispatch]
  );

  const onCompletePreTransactionConfirmation = useCallback(
    async (modifiedTransaction?: EthersTransactionRequest, context?: any) => {
      if (!activeAccount) return;
      backgroundDispatch(
        createUnsignedUserOp({ address: activeAccount, context })
      );
      backgroundDispatch(
        setModifyTransactionRequest(
          modifiedTransaction || sendTransactionRequest.transactionRequest
        )
      );
      setStage({
        stage: 'transaction-confirmation',
        context,
      });
    },
    [
      activeAccount,
      backgroundDispatch,
      sendTransactionRequest.transactionRequest,
    ]
  );

  const onCompleteTransactionConfirmation = useCallback(
    async (context?: any) => {
      setStage({
        stage: 'post-transaction-confirmation',
        context,
      });
    },
    []
  );

  const onCompletePostTransactionConfirmation = useCallback(
    async (context?: any) => {
      if (activeAccount) {
        onSend(context);
      }
    },
    [activeAccount, onSend]
  );

  const onReject = useCallback(async () => {
    if (activeAccount)
      await backgroundDispatch(rejectTransaction(activeAccount));
    window.close();
  }, [backgroundDispatch, activeAccount]);

  switch (stage.stage) {
    case 'pre-transaction-confirmation':
      return SignTransactionComponent?.PreTransactionConfirmation ? (
        <SignTransactionComponent.PreTransactionConfirmation
          onReject={onReject}
          transaction={sendTransactionRequest.transactionRequest}
          onComplete={onCompletePreTransactionConfirmation}
        />
      ) : (
        onCompletePreTransactionConfirmation(
          sendTransactionRequest.transactionRequest,
          {}
        )
      );
    case 'transaction-confirmation':
      return SignTransactionComponent?.TransactionConfirmation &&
        sendModiefiedTransactionRequest.transactionRequest &&
        pendingUserOp ? (
        <SignTransactionComponent.TransactionConfirmation
          context={stage.context}
          onReject={onReject}
          userOp={pendingUserOp}
          transaction={sendModiefiedTransactionRequest.transactionRequest}
          onComplete={onCompleteTransactionConfirmation}
        />
      ) : (
        <Container
          sx={{
            height: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <CircularProgress />
        </Container>
      );
    case 'post-transaction-confirmation':
      return (
        SignTransactionComponent?.PostTransactionConfirmation &&
        pendingUserOp && (
          <SignTransactionComponent.PostTransactionConfirmation
            context={stage.context}
            onReject={onReject}
            userOp={pendingUserOp}
            transaction={sendModiefiedTransactionRequest.transactionRequest}
            onComplete={onCompletePostTransactionConfirmation}
          />
        )
      );
  }
};

export default SignTransactionRequest;
