import React, { FC } from 'react';
import { BoxProps, Paper, Stack, Typography } from '@mui/material';
import { colors } from '../../../../config/const';

type Props = BoxProps & {
  activeAccount: string;
  accountInfo: { name: string };
};

const AccountInfo: FC<Props> = ({ activeAccount, accountInfo }) => {
  return (
    <Paper sx={{ background: colors.purple, color: colors.white }}>
      <Stack
        p={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack>
          <Typography fontSize="14px">Account Name</Typography>
          <Typography fontWeight="bold">{accountInfo.name} </Typography>
        </Stack>
        <Stack>
          <Typography fontSize="14px">Address</Typography>
          <Typography fontWeight="bold">
            ({activeAccount?.substring(0, 5)}...
            {activeAccount?.substring(activeAccount.length - 5)})
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AccountInfo;
