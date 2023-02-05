import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect } from 'react';
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

const DappPermission = () => {
  const permission = useBackgroundSelector(selectCurrentPendingPermission);

  const activeAccount = useBackgroundSelector(getActiveAccount);
  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, activeAccount)
  );

  const navigate = useNavigate();
  const backgroundDispatch = useBackgroundDispatch();

  useEffect(() => {
    if (!permission) navigate('/');
  }, [permission, navigate]);

  const deny = useCallback(async () => {
    // The denyOrRevokePermission will be dispatched in the onbeforeunload effect
    if (typeof permission !== 'undefined') {
      await backgroundDispatch(
        denyOrRevokePermission({
          ...permission,
        })
      );
    }
    window.close();
  }, [backgroundDispatch, permission]);

  const grant = useCallback(async () => {
    if (
      typeof permission !== 'undefined' &&
      typeof activeAccount !== 'undefined'
    ) {
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
        <span>
          <Typography component="span" textAlign="center" variant="h6">
            Connect to{' '}
          </Typography>
          <Typography component="span" variant="h6">
            {accountInfo.name.toLocaleUpperCase()}{' '}
          </Typography>
          <Typography component="span" variant="subtitle1" color="GrayText">
            ({activeAccount?.substring(0, 5)}...
            {activeAccount?.substring(activeAccount.length - 5)})
          </Typography>
        </span>
      </Box>
      <Stack spacing={2} sx={{ position: 'relative' }}>
        <Paper elevation={1}>
          <Box display="flex" padding={2}>
            <Box
              width={40}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <CardMedia
                component="img"
                sx={{ width: 40 }}
                image={permission?.faviconUrl || logo}
                alt={permission?.title}
              ></CardMedia>
            </Box>
            <Box
              sx={{ pl: 2 }}
              flexGrow={1}
              display="flex"
              flexDirection="column"
            >
              <Typography variant="subtitle1">{permission?.title}</Typography>
              <Typography color="GrayText" variant="body2">
                {permission?.origin}
              </Typography>
            </Box>
          </Box>
        </Paper>
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
      <Box
        sx={{
          position: 'absolute',
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
      </Box>
    </Container>
  );
};

export default DappPermission;
