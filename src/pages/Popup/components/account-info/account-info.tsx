import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';

const AccountInfo = ({
  activeAccount,
  accountInfo,
}: {
  activeAccount: string;
  accountInfo: { name: string };
}) => {
  return (
    <Paper sx={{ bgcolor: 'primary.light' }}>
      <Stack
        p={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack>
          <Typography variant="overline" color="primary.contrastText">
            Account Name
          </Typography>
          <Typography color="primary.contrastText" variant="body1">
            {accountInfo.name}{' '}
          </Typography>
        </Stack>
        <Stack>
          <Typography variant="overline" color="primary.contrastText">
            Address
          </Typography>
          <Typography variant="subtitle1" color="primary.contrastText">
            ({activeAccount?.substring(0, 5)}...
            {activeAccount?.substring(activeAccount.length - 5)})
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AccountInfo;
