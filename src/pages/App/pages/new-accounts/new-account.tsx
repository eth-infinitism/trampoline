import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  CardActions,
  CardContent,
  CircularProgress,
  FormControl,
  FormGroup,
  InputLabel,
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
import { HeadTitle } from '../../../../components/HeadTitle';
import { Button } from '../../../../components/Button';
import { BorderBox } from '../../../../components/BorderBox';
import { Center } from '../../../../components/Center';

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
        <HeadTitle title="New account" />
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
              title="Set name"
              onClick={nextStage}
              disabled={name.length === 0 || showLoader}
            />
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
    <Center minHeight="100vh" height="100%">
      <BorderBox>
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
        {!showLoader && stage === 'account-onboarding' && AccountOnboarding && (
          <AccountOnboarding
            accountName={name}
            onOnboardingComplete={onOnboardingComplete}
          />
        )}
      </BorderBox>
    </Center>
  );
};

export default NewAccount;
