import React, { useEffect } from 'react';
import {
  PostTransactionConfirmation,
  PostTransactionConfirmationtProps,
} from '../types';
import { CircularProgress, Container } from '@mui/material';

const PostTransactionConfirmationComponent: PostTransactionConfirmation = ({
  onComplete,
}: PostTransactionConfirmationtProps) => {
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  return (
    <Container
      sx={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <CircularProgress />
    </Container>
  );
};

export default PostTransactionConfirmationComponent;
