import React, { FC } from 'react';
import { Box, BoxProps } from '@mui/material';

type Props = BoxProps & {};

export const BorderBox: FC<Props> = ({ children, ...props }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        width: 600,
        minHeight: 300,
        border: '1px solid black',
        borderRadius: 4,
      }}
      p={4}
      {...props}
    >
      {children}
    </Box>
  );
};
