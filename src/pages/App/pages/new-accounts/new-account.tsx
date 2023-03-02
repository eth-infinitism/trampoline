import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormGroup,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import {
  ActiveAccountImplementation,
  AccountImplementations,
} from '../../constants';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import { createNewAccount } from '../../../Background/redux-slices/keyrings';
import { getSupportedNetworks } from '../../../Background/redux-slices/selectors/networkSelectors';
import { EVMNetwork } from '../../../Background/types/network';
import { useNavigate } from 'react-router-dom';
import { getAccountAdded } from '../../../Background/redux-slices/selectors/accountSelectors';
import { resetAccountAdded } from '../../../Background/redux-slices/account';
import { FlashOffOutlined } from '@mui/icons-material';

const TakeNameComponent = ({
  name,
  setName,
  showLoader,
  nextStage,
}: {
  name: string;
  setName: (name: string) => void;
  showLoader: boolean;
  nextStage: () => void;
}) => {
  return (
    <>
      <CardContent>
        <Typography textAlign="center" variant="h3" gutterBottom>
          New account
        </Typography>
        <Typography textAlign="center" variant="body1" color="text.secondary">
          Give a name to your account so that you can recoganise it easily.
        </Typography>
        <FormGroup sx={{ p: 2, pt: 4 }}>
          <FormControl sx={{ m: 1 }} variant="outlined">
            <InputLabel htmlFor="name">Name</InputLabel>
            <OutlinedInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              id="name"
              type="text"
              label="Name"
            />
          </FormControl>
        </FormGroup>
      </CardContent>
      <CardActions sx={{ width: '100%', pl: 2, pr: 2, pt: 0 }}>
        <Stack spacing={2} sx={{ width: '100%', pl: 2, pr: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Button
              sx={{ width: '100%' }}
              disabled={name.length === 0 || showLoader}
              size="large"
              variant="contained"
              onClick={nextStage}
            >
              Set name
            </Button>
            {showLoader && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Stack>
      </CardActions>
    </>
  );
};

const AccountOnboarding =
  AccountImplementations[ActiveAccountImplementation].Onboarding;

const NewAccount = () => {
  const [stage, setStage] = useState<'name' | 'account-onboarding'>('name');
  const [name, setName] = useState<string>('');
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const navigate = useNavigate();

  const backgroundDispatch = useBackgroundDispatch();

  const supportedNetworks: Array<EVMNetwork> =
    useBackgroundSelector(getSupportedNetworks);

  const addingAccount: string | null = useBackgroundSelector(getAccountAdded);

  useEffect(() => {
    if (addingAccount) {
      backgroundDispatch(resetAccountAdded());
      navigate('/');
    }
  }, [addingAccount, backgroundDispatch, navigate]);

  const onOnboardingComplete = useCallback(
    async (context?: any) => {
      setShowLoader(true);
      await backgroundDispatch(
        createNewAccount({
          name: name,
          chainIds: supportedNetworks.map((network) => network.chainID),
          implementation: ActiveAccountImplementation,
          context,
        })
      );
      setShowLoader(false);
    },
    [backgroundDispatch, supportedNetworks, name]
  );

  const nextStage = useCallback(() => {
    setShowLoader(true);
    if (stage === 'name' && AccountOnboarding) {
      setStage('account-onboarding');
    }
    if (stage === 'name' && !AccountOnboarding) {
      onOnboardingComplete();
    }
    setShowLoader(false);
  }, [stage, setStage, onOnboardingComplete]);

  return (
    <Container sx={{ height: '100vh' }}>
      <Stack
        spacing={2}
        sx={{ height: '100%' }}
        justifyContent="center"
        alignItems="center"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: 600,
            minHeight: 300,
            p: 2,
            border: '1px solid #d6d9dc',
            background: 'white',
            borderRadius: 5,
          }}
        >
          {showLoader && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
          {!showLoader && stage === 'name' && (
            <TakeNameComponent
              name={name}
              setName={setName}
              showLoader={showLoader}
              nextStage={nextStage}
            />
          )}
          {!showLoader &&
            stage === 'account-onboarding' &&
            AccountOnboarding && (
              <AccountOnboarding
                accountName={name}
                onOnboardingComplete={onOnboardingComplete}
              />
            )}
        </Box>
      </Stack>
    </Container>
  );
};

export default NewAccount;
