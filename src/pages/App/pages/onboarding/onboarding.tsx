import { Container } from '@mui/material';
import React, { useEffect } from 'react';
import { redirect } from 'react-router-dom';
import { getAddressCount } from '../../../Background/redux-slices/selectors/accountSelectors';
import { useBackgroundSelector } from '../../hooks';
import Intro from './intro';

const Onboarding = () => {
  const hasAccounts = useBackgroundSelector(
    (state) => getAddressCount(state) > 0
  );

  useEffect(() => {
    if (hasAccounts) {
      redirect('/');
    }
  }, [hasAccounts]);

  return (
    <Container sx={{ height: '100vh' }}>
      <Intro />
    </Container>
  );
};

export default Onboarding;
