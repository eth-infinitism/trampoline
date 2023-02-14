import { Box, CardMedia, Paper, Typography } from '@mui/material';
import React from 'react';
import { PermissionRequest } from '../../../Background/services/provider-bridge';
import logo from '../../../../assets/img/dapp_favicon_default@2x.png';

const OriginInfo = ({ permission }: { permission?: PermissionRequest }) => {
  if (!permission) return <></>;

  return (
    <Paper elevation={1}>
      <Box display="flex" padding={2} sx={{ overflow: 'scroll' }}>
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
        <Box sx={{ pl: 2 }} flexGrow={1} display="flex" flexDirection="column">
          <Typography variant="subtitle1">{permission?.title}</Typography>
          <Typography color="GrayText" variant="body2">
            {permission?.origin}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default OriginInfo;
