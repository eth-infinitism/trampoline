import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import AccountInfo from '../account-info';
import OriginInfo from '../origin-info';

const SignConfirmation = ({
  activeAccount,
  originPermission,
  accountInfo,
  pendingSigningDataRequest,
  onCancel,
  onSign,
}: any) => {
  return (
    <Container>
      <Box sx={{ p: 2 }}>
        <Typography textAlign="center" variant="h6">
          Sginature Request
        </Typography>
      </Box>
      <AccountInfo
        activeAccount={activeAccount || ''}
        accountInfo={accountInfo}
      />
      <Stack spacing={2} sx={{ position: 'relative', pt: 2, mb: 4 }}>
        <OriginInfo permission={originPermission} />
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            You are signing:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <pre className="sign-message-pre-tag">
                {typeof pendingSigningDataRequest?.signingData === 'string'
                  ? pendingSigningDataRequest?.signingData
                  : pendingSigningDataRequest?.signingData.unparsedMessageData}
              </pre>
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
          <Button sx={{ width: 150 }} variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button sx={{ width: 150 }} variant="contained" onClick={onSign}>
            Sign
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignConfirmation;
