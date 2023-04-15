import { OutlinedInputProps, OutlinedInput } from '@mui/material';
import React, { FC } from 'react';
import { colors } from '../config/const';

export const FormInput: FC<OutlinedInputProps> = ({ sx, ...props }) => {
  return (
    <OutlinedInput
      autoFocus={false}
      id="name"
      type="text"
      sx={{
        borderColor: colors.white,
        color: colors.white,
        '& label': {
          color: colors.white,
        },
        '& input[placeholder=*]': {
          color: `${colors.white} !important`,
        },
        '& fieldset': {
          borderColor: colors.white,
        },
        ...sx,
      }}
      {...props}
    />
  );
};
