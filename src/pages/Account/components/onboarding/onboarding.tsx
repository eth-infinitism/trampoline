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
    <div
      style={{
        fontFamily: 'Poppins',
      }}
    >
      <Box sx={{ padding: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight="500">
            Labore laborum aliquip veniam.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ea laboris mollit esse tempor eiusmod elit veniam voluptate minim
            aliquip amet mollit officia id. Cillum minim ex incididunt ut
            exercitation ex dolore labore. Cupidatat esse cupidatat ea proident
            reprehenderit consequat do et non aute cillum.
            <br />
            Laborum aute ex dolore veniam tempor anim aute. Exercitation dolor
            consequat nostrud eu nulla pariatur incididunt officia officia
            incididunt irure ipsum commodo.
          </Typography>
        </CardContent>
        <CardActions sx={{ width: '100%' }}>
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button
              size="large"
              color="secondary"
              variant="contained"
              onClick={() => onOnboardingComplete()}
              sx={{
                borderRadius: '50px',
              }}
            >
              Create account
            </Button>
          </Stack>
        </CardActions>
      </Box>
    </div>
  );
};

export default Onboarding;
