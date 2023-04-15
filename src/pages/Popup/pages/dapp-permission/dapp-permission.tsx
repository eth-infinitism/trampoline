import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import { selectCurrentPendingPermission } from '../../../Background/redux-slices/selectors/dappPermissionSelectors';
import {
  getAccountInfo,
  getActiveAccount,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import {
  denyOrRevokePermission,
  grantPermission,
} from '../../../Background/redux-slices/permissions';
import AccountInfo from '../../components/account-info';
import { BorderBox } from '../../../../components/BorderBox';
import { RejectButton } from '../../../../components/RejectButton';
import { Button } from '../../../../components/Button';

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
    <Box px={2} color="white">
      <Typography
        my={4}
        fontSize="28px"
        fontWeight="bold"
        children="Connection Request"
      />
      {activeAccount && (
        <AccountInfo activeAccount={activeAccount} accountInfo={accountInfo} />
      )}
      <Typography
        mt={6}
        fontSize="24px"
        fontWeight="bold"
        children="Requesting permissions"
      />
      <BorderBox mb={4} p={2}>
        <Stack spacing={1}>
          <Typography variant="body2">• See address</Typography>
          <Typography variant="body2">• Account Balance</Typography>
          <Typography variant="body2">• Past transactions activity</Typography>
          <Typography variant="body2">
            • Suggest new transactions for approvals
          </Typography>
          <Typography variant="body2">• Request signatures</Typography>
        </Stack>
      </BorderBox>
      <Stack
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <RejectButton fullWidth title="Reject" onClick={deny} />
        <Box width="32px" />
        <Button fullWidth title="Connect" onClick={grant} />
      </Stack>
    </Box>
  );
};

export default DappPermission;
