import { UserOperationStruct } from '@account-abstraction/contracts';
import { Box, Stack, Typography } from '@mui/material';
import { ethers } from 'ethers';
import React, { FC, useCallback, useState } from 'react';
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
  selectCurrentPendingSendTransactionRequest,
  selectCurrentPendingSendTransactionsRequest,
  selectCurrentPendingSendTransactionUserOp,
} from '../../../Background/redux-slices/selectors/transactionsSelectors';
import {
  createUnsignedUserOp,
  rejectTransaction,
  sendTransaction,
  setUnsignedUserOperation,
} from '../../../Background/redux-slices/transactions';
import { EthersTransactionRequest } from '../../../Background/services/types';
import AccountInfo from '../../components/account-info';
import Config from '../../../../exconfig';
import { Button } from '../../../../components/Button';
import { BorderBox } from '../../../../components/BorderBox';
import { RejectButton } from '../../../../components/RejectButton';

const SignTransactionComponent =
  AccountImplementations[ActiveAccountImplementation].Transaction;

type Props = {
  activeNetwork: any;
  activeAccount: any;
  accountInfo: any;
  originPermission: any;
  transactions: EthersTransactionRequest[];
  userOp: UserOperationStruct;
  onReject: any;
  onSend: any;
};

const SignTransactionConfirmation: FC<Props> = ({
  activeNetwork,
  activeAccount,
  accountInfo,
  originPermission,
  transactions,
  userOp,
  onReject,
  onSend,
}) => {
  const backgroundDispatch = useBackgroundDispatch();
  const [showAddPaymasterUI, setShowAddPaymasterUI] = useState<boolean>(false);
  const [addPaymasterLoader, setAddPaymasterLoader] = useState<boolean>(false);
  const [paymasterError, setPaymasterError] = useState<string>('');
  const [paymasterUrl, setPaymasterUrl] = useState<string>('');

  const addPaymaster = useCallback(async () => {
    console.log(paymasterUrl);
    setAddPaymasterLoader(true);
    if (paymasterUrl) {
      const paymasterRPC = new ethers.providers.JsonRpcProvider(paymasterUrl, {
        name: 'Paymaster',
        chainId: parseInt(activeNetwork.chainID),
      });
      try {
        const paymasterResp = await paymasterRPC.send(
          'eth_getPaymasterAndDataSize',
          [userOp]
        );
        backgroundDispatch(
          setUnsignedUserOperation({
            ...userOp,
            paymasterAndData: paymasterResp,
            verificationGasLimit: paymasterResp.verificationGasLimit,
          })
        );
      } catch (e) {
        console.log(e);
        setPaymasterError('Paymaster url returned error');
      }
      setAddPaymasterLoader(false);
    }
  }, [activeNetwork.chainID, backgroundDispatch, paymasterUrl, userOp]);

  return (
    <Box px={2} color="white">
      <Typography
        my={4}
        fontSize="28px"
        fontWeight="bold"
        children="Send Transaction Request"
      />
      {activeAccount && (
        <AccountInfo activeAccount={activeAccount} accountInfo={accountInfo} />
      )}
      <Stack spacing={2} sx={{ position: 'relative', pt: 2, mb: 4 }}>
        {/* TODO: Original Info */}
        {/* <OriginInfo permission={originPermission} /> */}
        {/* TODO: Paymaster Info */}
        {/* <Typography variant="h6" sx-={{ p: 2 }}>
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
            {paymasterError}
            <Box
              justifyContent="space-around"
              alignItems="center"
              display="flex"
              sx={{ p: '16px 0px' }}
            >
              <Button
                sx={{ width: 150 }}
                variant="outlined"
                onClick={() => {
                  setShowAddPaymasterUI(false);
                  setAddPaymasterLoader(false);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={addPaymasterLoader}
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
        )} */}
        {/* Transactions Data */}
        <Typography
          mt={2}
          fontSize="24px"
          fontWeight="bold"
          children={
            transactions.length > 1 ? ' Transactions Data' : 'Transaction Data'
          }
        />
        <Stack spacing={2}>
          {transactions.map((transaction: EthersTransactionRequest, index) => (
            <BorderBox p={2} key={index}>
              <Typography mb={1} fontSize="14px">
                To{' '}
                <Typography fontWeight="bold" noWrap>
                  {transaction.to}
                </Typography>
              </Typography>
              <Typography mb={1} fontSize="14px">
                Data{' '}
                <Typography fontWeight="bold">
                  {transaction.data?.toString()}
                </Typography>
              </Typography>
              <Typography mb={1} fontSize="14px">
                Value{' '}
                <Typography fontWeight="bold">
                  {transaction.value
                    ? ethers.utils.formatEther(transaction.value)
                    : 0}{' '}
                  {activeNetwork.baseAsset.symbol}
                </Typography>
              </Typography>
            </BorderBox>
          ))}
        </Stack>
      </Stack>
      {!showAddPaymasterUI && (
        <Stack
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <RejectButton fullWidth title="Reject" onClick={onReject} />
          <Box width="32px" />
          <Button fullWidth title="Send" onClick={onSend} />
        </Stack>
      )}
    </Box>
  );
};

const SignTransactionRequest = () => {
  const [stage, setStage] = useState<
    'custom-account-screen' | 'sign-transaction-confirmation'
  >('custom-account-screen');

  const [context, setContext] = useState(null);

  const backgroundDispatch = useBackgroundDispatch();
  const activeAccount = useBackgroundSelector(getActiveAccount);
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, activeAccount)
  );

  const sendTransactionRequest = useBackgroundSelector(
    selectCurrentPendingSendTransactionRequest
  );

  const sendTransactionsRequest = useBackgroundSelector(
    selectCurrentPendingSendTransactionsRequest
  );

  const pendingUserOp = useBackgroundSelector(
    selectCurrentPendingSendTransactionUserOp
  );

  const originPermission = useBackgroundSelector((state) =>
    selectCurrentOriginPermission(state, {
      origin: sendTransactionRequest?.origin || '',
      address: activeAccount || '',
    })
  );

  const onSend = useCallback(
    async (_context?: any) => {
      if (activeAccount)
        await backgroundDispatch(
          sendTransaction({
            address: activeAccount,
            context: _context || context,
          })
        );
      window.close();
    },
    [activeAccount, backgroundDispatch, context]
  );

  const onComplete = useCallback(
    async (modifiedTransaction: EthersTransactionRequest, context?: any) => {
      if (activeAccount) {
        // NOTE: bundlerに送るユーザーオペレーションを作成している
        backgroundDispatch(createUnsignedUserOp(activeAccount));
        setContext(context);
        if (Config.showTransactionConfirmationScreen === false) {
          onSend(context);
        }
        setStage('sign-transaction-confirmation');
      }
    },
    [setContext, setStage, activeAccount, backgroundDispatch, onSend]
  );

  const onReject = useCallback(async () => {
    if (activeAccount)
      await backgroundDispatch(rejectTransaction(activeAccount));
    window.close();
  }, [backgroundDispatch, activeAccount]);

  if (
    stage === 'sign-transaction-confirmation' &&
    pendingUserOp &&
    sendTransactionsRequest.transactionsRequest
    // sendTransactionRequest.transactionRequest
  )
    return (
      <SignTransactionConfirmation
        activeNetwork={activeNetwork}
        activeAccount={activeAccount}
        accountInfo={accountInfo}
        originPermission={originPermission}
        onReject={onReject}
        onSend={onSend}
        transactions={sendTransactionsRequest.transactionsRequest || []}
        userOp={pendingUserOp}
      />
    );

  return SignTransactionComponent &&
    sendTransactionRequest.transactionRequest ? (
    <SignTransactionComponent
      onReject={onReject}
      transaction={sendTransactionRequest.transactionRequest}
      onComplete={onComplete}
    />
  ) : null;
};

export default SignTransactionRequest;
