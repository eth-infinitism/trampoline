import { Box, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { getAccountInfo } from '../../../Background/redux-slices/selectors/accountSelectors';
import { useBackgroundSelector } from '../../hooks';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const AccountInfo = ({
  address,
  showOptions = true,
}: {
  address: string;
  showOptions: boolean;
}) => {
  const [tooltipMessage, setTooltipMessage] = useState<string>('Copy address');

  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, address)
  );

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    setTooltipMessage('Address copied');
  }, [address]);

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.20)',
        position: 'relative',
      }}
    >
      <Box
        component="div"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
      >
        <Tooltip title={tooltipMessage} enterDelay={0}>
          <Box
            onClick={copyAddress}
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              minWidth: 300,
              borderRadius: 4,
              cursor: 'pointer',
              '&:hover': {
                background: '#f2f4f6',
              },
            }}
          >
            <Typography variant="h6">{accountInfo.name}</Typography>

            <Box
              component="div"
              display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="overline">
                {address.substring(0, 5)}...
                {address.substring(address.length - 5)}
              </Typography>
              <ContentCopyIcon sx={{ height: 16, cursor: 'pointer' }} />
            </Box>
          </Box>
        </Tooltip>
      </Box>
      {showOptions && <MoreVertIcon sx={{ position: 'absolute', right: 0 }} />}
    </Box>
  );
};

export default AccountInfo;
