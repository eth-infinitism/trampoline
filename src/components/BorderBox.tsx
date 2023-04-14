import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

type Props = BoxProps & {};

export const BorderBox: FC<Props> = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        borderRadius: 4,
        backdropFilter: 'blur(9px)',
        background: 'rgba(30, 30, 30, 0.38)',
        boxShadow:
          '0px 32px 32px -8px rgba(0, 0, 0, 0.08), 0px 0px 32px -8px rgba(0, 0, 0, 0.12),',
        ...sx,
      }}
      p={4}
      color="white"
      {...props}
    >
      {children}
    </Box>
  );
};
