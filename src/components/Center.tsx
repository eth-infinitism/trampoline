import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

type Props = BoxProps & {};

export const Center: FC<Props> = ({ children, ...props }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      {children}
    </Box>
  );
};
