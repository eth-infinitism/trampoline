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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  selectCurrentPendingSendTransactionUserOp,
} from '../../../Background/redux-slices/selectors/transactionsSelectors';
import {
  clearTransactionState,
  createUnsignedUserOp,
  modifyTransactionsRequest,
  rejectTransaction,
  sendTransaction,
} from '../../../Background/redux-slices/transactions';
import { EthersTransactionRequest } from '../../../Background/services/types';
import AccountInfo from '../../components/account-info';
import OriginInfo from '../../components/origin-info';
import Config from '../../../../exconfig.json';
import { Provider } from 'zksync-web3';

const MEMBERSHIP_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address',
      },
    ],
    name: 'userTier',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tier',
        type: 'uint256',
      },
    ],
    name: 'benefit',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const SignTransactionComponent =
  AccountImplementations[ActiveAccountImplementation].Transaction;

const SignTransactionConfirmation = ({
  activeNetwork,
  activeAccount,
  accountInfo,
  originPermission,
  transactions,
  // userOp,
  onReject,
  onSend,
}: {
  activeNetwork: any;
  activeAccount: any;
  accountInfo: any;
  originPermission: any;
  transactions: EthersTransactionRequest[];
  // userOp: UserOperationStruct;
  onReject: any;
  onSend: any;
}) => {
  const [showAddPaymasterUI, setShowAddPaymasterUI] = useState<boolean>(false);
  const [addPaymasterLoader, setAddPaymasterLoader] = useState<boolean>(false);
  const provider = useMemo(
    () => new Provider('https://zksync2-testnet.zksync.dev'),
    []
  );

  console.log('account info', accountInfo, activeAccount);

  const [tier, setTier] = useState<number>(1);
  const [gasDiscount, setGasDiscount] = useState<number>(0);
  const [gasCost, setGasCost] = useState();

  useEffect(() => {
    // hardcoded for demo purposes
    // ideally we want to maintain a list of memberships that can be associated with transaction
    const memberContract = new ethers.Contract(
      '0x4d69de6Ce6EdDb5F35D6549A25332Ff15D718FCB',
      MEMBERSHIP_ABI,
      provider
    );

    memberContract.userTier(activeAccount).then((value) => {
      const t = value.toNumber();

      console.log('tier value', value);
      setTier(t);

      memberContract.benefit(t).then((ben) => {
        console.log('gas cost', ben);
        setGasDiscount(ben.toNumber());
      });
    });
  }, []);

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
        {/* {tier > 0 && ( */}
        <>
          <Typography variant="h6" sx-={{ p: 2 }}>
            Membership Info
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: '0.25rem',
              }}
            >
              Tier:
            </Typography>
            <Typography variant="subtitle2">{3}</Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: '0.25rem',
              }}
            >
              Benefit:
            </Typography>
            <Typography variant="subtitle2">{15}% Gas fee discount</Typography>
          </Paper>
        </>
        {/* )} */}

        <Typography variant="h6" sx-={{ p: 2 }}>
          {transactions.length > 1 ? ' Transactions data' : 'Transaction data'}
        </Typography>
        <Stack spacing={2}>
          {transactions.map((transaction: EthersTransactionRequest) => (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                To:{' '}
                <Typography component="span" variant="body2">
                  <pre className="sign-message-pre-tag">{transaction.to}</pre>
                </Typography>
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Data:{' '}
                <Typography component="span" variant="body2">
                  <pre className="sign-message-pre-tag">
                    {transaction.data?.toString()}
                  </pre>
                </Typography>
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
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
              onClick={() => onSend()}
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

const SignTransactionRequest = () => {
  const [stage, setStage] = useState<
    'custom-account-screen' | 'sign-transaction-confirmation'
  >('sign-transaction-confirmation');

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

  // const onComplete = useCallback(
  //   async (modifiedTransaction: EthersTransactionRequest, context?: any) => {
  //     if (activeAccount) {
  //       console.log('on sign tx complete llog check');
  //       setStage('sign-transaction-confirmation');
  //     }
  //   },
  //   [setContext, setStage, activeAccount, backgroundDispatch, onSend]
  // );

  const onReject = useCallback(async () => {
    if (activeAccount)
      await backgroundDispatch(rejectTransaction(activeAccount));
    window.close();
  }, [backgroundDispatch, activeAccount]);

  // if (
  // stage === 'sign-transaction-confirmation' &&
  // sendTransactionRequest.transactionRequest
  // )
  //   return (

  return sendTransactionRequest.transactionRequest ? (
    <SignTransactionConfirmation
      activeNetwork={activeNetwork}
      activeAccount={activeAccount}
      accountInfo={accountInfo}
      originPermission={originPermission}
      onReject={onReject}
      onSend={onSend}
      transactions={[sendTransactionRequest.transactionRequest]}
    />
  ) : null;

  // );

  // return SignTransactionComponent &&
  //   sendTransactionRequest.transactionRequest ? (
  //   <SignTransactionComponent
  //     onReject={onReject}
  //     transaction={sendTransactionRequest.transactionRequest}
  //     onComplete={onComplete}
  //   />
  // ) : null;
};

export default SignTransactionRequest;
