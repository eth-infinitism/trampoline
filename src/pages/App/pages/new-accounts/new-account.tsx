import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  BoxProps,
  CircularProgress,
  FormControl,
  FormGroup,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EastIcon from '@mui/icons-material/East';
import {
  ActiveAccountImplementation,
  AccountImplementations,
} from '../../constants';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import { createNewAccount } from '../../../Background/redux-slices/keyrings';
import { getSupportedNetworks } from '../../../Background/redux-slices/selectors/networkSelectors';
import { EVMNetwork } from '../../../Background/types/network';
import { getAccountAdded } from '../../../Background/redux-slices/selectors/accountSelectors';
import { resetAccountAdded } from '../../../Background/redux-slices/account';
import { HeadTitle } from '../../../../components/HeadTitle';
import { Button } from '../../../../components/Button';
import { BorderBox } from '../../../../components/BorderBox';
import { Center } from '../../../../components/Center';
import { Row } from '../../../../components/Row';
import { FormInput } from '../../../../components/FormInput';
import { colors } from '../../../../config/const';

type TakeNameComponentProps = BoxProps & {
  name: string;
  setName: (name: string) => void;
  showLoader: boolean;
  nextStage: () => void;
};

const TakeNameComponent: FC<TakeNameComponentProps> = ({
  name,
  setName,
  showLoader,
  nextStage,
}) => {
  return (
    <>
      <HeadTitle title="Create Account" />
      <Typography marginBottom={4} width="100%" variant="body1" color="white">
        Give a name to your account so that you can recoganise it easily.
      </Typography>
      <FormGroup sx={{ width: '100%' }}>
        <FormControl sx={{ m: 1 }}>
          {/* <InputLabel htmlFor="name">Account Name</InputLabel> */}
          <FormInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Account Name"
            // id="name"
            // label="Account Name"
          />
        </FormControl>
      </FormGroup>
      <Row textAlign="right">
        <Button
          sx={{ marginLeft: 'auto', marginTop: 8 }}
          title="Create"
          onClick={nextStage}
          disabled={name.length === 0 || showLoader}
          icon={
            <EastIcon
              sx={{
                color:
                  name.length === 0 || showLoader
                    ? colors.disabled
                    : colors.white,
              }}
            />
          }
        />
      </Row>
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
    <Center minHeight="100vh" height="100%" width="60%" marginX="auto">
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
