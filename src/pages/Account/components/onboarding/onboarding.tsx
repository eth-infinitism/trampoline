import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    FormControl,
    FormGroup,
    InputLabel,
    OutlinedInput,
    Typography,
  } from '@mui/material';
  import { Stack } from '@mui/system';
  import React, { useCallback, useEffect, useState } from 'react';
  import { useAccount, useConnect } from 'wagmi';
  import { OnboardingComponent, OnboardingComponentProps } from '../types';

  const Onboarding: OnboardingComponent = ({
    accountName,
    onOnboardingComplete,
  }: OnboardingComponentProps) => {
    const { connect, connectors, error, isLoading, pendingConnector } =
      useConnect();

    const { address, isConnected } = useAccount();

    useEffect(() => {
      if (isConnected) {
        onOnboardingComplete({
          address,
        });
      }
    }, [isConnected, address, onOnboardingComplete]);

    return (
      <>
        <CardContent>
          <Typography variant="h3" gutterBottom>
            Add 2FA Device
          </Typography>
          <Typography variant="body1" color="text.secondary">
            All your transactions must be signed by your mobile wallet and this
            chrome extension to prevent fraudulant transactions.
            <br />
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
          <Stack spacing={2} sx={{ width: '100%' }}>
            {connectors.map((connector) => (
              <Button
                size="large"
                variant="contained"
                disabled={!connector.ready}
                key={connector.id}
                onClick={() => connect({ connector })}
              >
                {connector.name}
                {!connector.ready && ' (unsupported)'}
                {isLoading &&
                  connector.id === pendingConnector?.id &&
                  ' (connecting)'}
              </Button>
            ))}

            {error && <Typography>{error.message}</Typography>}
          </Stack>
        </CardActions>
      </>
    );
  };

  export default Onboarding;