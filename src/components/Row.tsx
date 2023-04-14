import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

type Props = BoxProps & {};

export const Row: FC<Props> = ({ children, ...props }) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center" {...props}>
      {children}
    </Box>
  );
};
