import {
  Box,
  Button,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import { OnboardingComponent, OnboardingComponentProps } from '../types';

const Onboarding: OnboardingComponent = ({
  onOnboardingComplete,
}: OnboardingComponentProps) => {
  return (
    <>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Dummy Account Component
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You can show as many steps as you want in this dummy component. You
          need to call the function <b>onOnboardingComplete</b> passed as a
          props to this component. <br />
          <br />
          The function takes a context as a parameter, this context will be
          passed to your AccountApi when creating a new account.
        </Typography>
      </CardContent>
      <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Button
            size="large"
            variant="contained"
            onClick={() => onOnboardingComplete()}
          >
            Continue
          </Button>
        </Stack>
      </CardActions>
    </>
  );
};

export default Onboarding;
