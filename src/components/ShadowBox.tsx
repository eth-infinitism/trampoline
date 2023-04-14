import React, { FC } from 'react';
import { CardProps, Card, CardContent } from '@mui/material';

type Props = CardProps & {};

export const ShadowBox: FC<Props> = ({ children, ...props }) => {
  return (
    <Card {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
