import React, { FC } from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';
import { colors } from '../config/const';

type Props = ButtonProps & {};

export const Button: FC<Props> = ({ children, title, disabled, ...props }) => {
  const enabledStyle = {
    width: '100%',
    color: colors.white,
    background: colors.dark,
    ':hover': { background: 'gray' },
  };
  const disabledStyle = {
    width: '100%',
  };
  return (
    <MuiButton
      // size="large"
      // variant="contained"
      sx={disabled ? disabledStyle : enabledStyle}
      disabled={disabled}
      {...props}
    >
      {title || children}
    </MuiButton>
  );
};
