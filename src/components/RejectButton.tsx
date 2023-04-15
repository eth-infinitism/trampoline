import React, { FC, ReactNode } from 'react';
import { Button as MuiButton, ButtonProps, Typography } from '@mui/material';
import { colors } from '../config/const';

type Props = ButtonProps & {
  icon?: ReactNode;
};

export const RejectButton: FC<Props> = ({
  children,
  title,
  disabled,
  sx,
  icon,
  ...props
}) => {
  const enabledStyle = {
    color: colors.error,
    background: 'rgba(142, 142, 142, 0.16)',
    ':hover': { opacity: 0.8 },
  };
  const disabledStyle = {};
  return (
    <MuiButton
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
        sx={{ color: disabled ? colors.disabled : colors.error }}
      >
        {title}
      </Typography>
      {icon}
    </MuiButton>
  );
};
