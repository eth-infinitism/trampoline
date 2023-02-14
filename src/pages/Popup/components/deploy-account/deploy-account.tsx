import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useCallback } from 'react';
import AccountInfo from '../account-info';
import OriginInfo from '../origin-info';

const DeployAccount = ({
  accountInfo,
  activeAccount,
  originPermission,
}: any) => {
  const openExpandedView = useCallback(() => {
    const url = chrome.runtime.getURL('app.html#/deploy-account');
    chrome.tabs.create({
      url,
    });
    window.close();
  }, []);

  return (
    <Container>
      <Box sx={{ p: 2 }}>
        <Typography textAlign="center" variant="h6">
          Account not deployed
        </Typography>
      </Box>
      <AccountInfo
        accountInfo={accountInfo}
        activeAccount={activeAccount || ''}
      />
      <Stack spacing={2} sx={{ position: 'relative', pt: 2 }}>
        <OriginInfo permission={originPermission} />
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Account must be deployed before it can sign any message. You will
            have to perform the following steps:
          </Typography>{' '}
          <Stack spacing={1}>
            <Typography variant="body2">
              • Transfer minimum required funds to the account
            </Typography>
            <Typography variant="body2">
              • Initiate Deploy transaction
            </Typography>
            <Typography variant="body2">
              • Wait for the deployment transaction to be added to the
              blockchain
            </Typography>
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
          <Button
            sx={{ width: '100%' }}
            variant="contained"
            onClick={openExpandedView}
          >
            Deploy now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DeployAccount;
