import React, { FC } from 'react';
import { Button as MuiButton, ButtonProps, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { colors } from '../config/const';

type Props = ButtonProps & {};

export const Button: FC<Props> = ({
  children,
  title,
  disabled,
  sx,
  ...props
}) => {
  const enabledStyle = {
    color: colors.white,
    background: colors.purple,
    ':hover': { opacity: 0.8 },
  };
  const disabledStyle = {};
  return (
    <MuiButton
      // size="large"
      // variant="contained"
      sx={{
        paddingX: '40px',
        lineHeight: '42px',
        borderRadius: '999999px',
        fontSize: '18px',
        fontWeight: 'bold',
        textTransform: 'none',
        ...(disabled ? disabledStyle : enabledStyle),
        ...sx,
      }}
      disabled={disabled}
      {...props}
    >
      <Typography
        mr={1}
        variant="h6"
        sx={{ color: disabled ? colors.disabled : colors.white }}
      >
        {title}
      </Typography>
      <SendRoundedIcon
        sx={{ color: disabled ? colors.disabled : colors.white }}
      />
    </MuiButton>
  );
};
