import React, { FC, ReactNode } from 'react';
import { Box, Button as MuiButton, ButtonProps } from '@mui/material';
import { colors } from '../config/const';
import { Center } from './Center';

type Props = ButtonProps & {
  icon: ReactNode;
};

export const MainButton: FC<Props> = ({
  children,
  title,
  sx,
  icon,
  ...props
}) => {
  return (
    <MuiButton
      sx={{
        pl: 2,
        py: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        borderRadius: 2,
        backdropFilter: 'blur(9px)',
        color: colors.white,
        background: 'rgba(30, 30, 30, 0.38)',
        boxShadow:
          '0px 32px 32px -8px rgba(0, 0, 0, 0.08), 0px 0px 32px -8px rgba(0, 0, 0, 0.12),',
        ...sx,
      }}
      {...props}
    >
      <Center
        mb={2}
        p={1.5}
        mr="auto"
        bgcolor="white"
        borderRadius="9999px"
        children={icon}
      />
      <Box
        fontSize="18px"
        fontWeight="bold"
        width="100%"
        textAlign="left"
        children={title}
      />
    </MuiButton>
  );
};
