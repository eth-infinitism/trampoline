import React, { FC } from 'react';
import { Typography, TypographyProps } from '@mui/material';

type Props = TypographyProps & {};

export const HeadTitle: FC<Props> = ({ children, title, ...props }) => {
  return (
    <Typography
      variant="h3"
      fontWeight="bold"
      letterSpacing={2}
      width="100%"
      m={0}
      {...props}
    >
      {title || children}
    </Typography>
  );
};
