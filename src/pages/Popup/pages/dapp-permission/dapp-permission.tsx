import {
  Box,
  Button,
  CardMedia,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import { selectCurrentPendingPermission } from '../../../Background/redux-slices/selectors/dappPermissionSelectors';
import logo from '../../../../assets/img/dapp_favicon_default@2x.png';
import BoltIcon from '@mui/icons-material/Bolt';
import {
  getAccountInfo,
  getActiveAccount,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import {
  denyOrRevokePermission,
  grantPermission,
} from '../../../Background/redux-slices/permissions';
import AccountInfo from '../../components/account-info';
import OriginInfo from '../../components/origin-info';

const DappPermission = () => {
  const permission = useBackgroundSelector(selectCurrentPendingPermission);
  const [awaitingBackgroundDispatch, setAwaitingBackgroundDispatch] =
    useState(false);

  const activeAccount = useBackgroundSelector(getActiveAccount);
  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, activeAccount)
  );

  const navigate = useNavigate();
  const backgroundDispatch = useBackgroundDispatch();

  useEffect(() => {
    if (!permission && !awaitingBackgroundDispatch) navigate('/');
  }, [permission, awaitingBackgroundDispatch, navigate]);

  const deny = useCallback(async () => {
    console.log('is this the problem?');
    // The denyOrRevokePermission will be dispatched in the onbeforeunload effect
    if (typeof permission !== 'undefined') {
      setAwaitingBackgroundDispatch(true);
      await backgroundDispatch(
        denyOrRevokePermission({
          ...permission,
        })
      );
    }
    window.close();
  }, [permission, backgroundDispatch]);

  const grant = useCallback(async () => {
    if (
      typeof permission !== 'undefined' &&
      typeof activeAccount !== 'undefined'
    ) {
      setAwaitingBackgroundDispatch(true);
      await backgroundDispatch(
        grantPermission({
          ...permission,
          accountAddress: activeAccount, // make sure address is matching current account
          state: 'allow',
        })
      );
    }
    window.close();
  }, [backgroundDispatch, permission, activeAccount]);

  return (
    <Container>
      <Box sx={{ p: 2 }}>
        <Typography textAlign="center" variant="h6">
          Connection Request
        </Typography>
      </Box>
      <AccountInfo
        accountInfo={accountInfo}
        activeAccount={activeAccount || ''}
      />
      <Stack spacing={2} sx={{ position: 'relative', pt: 2, mb: 4 }}>
        <OriginInfo permission={permission} />
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Requesting permissions
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">• See address</Typography>
            <Typography variant="body2">• Account Balance</Typography>
            <Typography variant="body2">
              • Past transactions activity
            </Typography>
            <Typography variant="body2">
              • Suggest new transactions for approvals
            </Typography>
            <Typography variant="body2">• Request signatures</Typography>
          </Stack>
        </Paper>
      </Stack>
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
          <Button sx={{ width: 150 }} variant="outlined" onClick={deny}>
            Reject
          </Button>
          <Button sx={{ width: 150 }} variant="contained" onClick={grant}>
            Connect
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DappPermission;
