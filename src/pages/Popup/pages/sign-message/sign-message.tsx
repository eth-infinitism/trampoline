import React, { useCallback, useState } from 'react';
import { useEffect } from 'react';
import {
  AccountImplementations,
  ActiveAccountImplementation,
} from '../../../App/constants';
import {
  useBackgroundDispatch,
  useBackgroundSelector,
} from '../../../App/hooks';
import { getAccountData } from '../../../Background/redux-slices/account';
import {
  getAccountEVMData,
  getAccountInfo,
  getActiveAccount,
} from '../../../Background/redux-slices/selectors/accountSelectors';
import { selectCurrentOriginPermission } from '../../../Background/redux-slices/selectors/dappPermissionSelectors';
import { getActiveNetwork } from '../../../Background/redux-slices/selectors/networkSelectors';
import { selectCurrentPendingSignDataRequest } from '../../../Background/redux-slices/selectors/signingRequestSelectors';
import {
  clearSigningState,
  getSignedData,
} from '../../../Background/redux-slices/signing';
import DeployAccount from '../../components/deploy-account';
import SignConfirmation from '../../components/sign-confirmation';
import './sign-message.css';

const SignMessageComponent =
  AccountImplementations[ActiveAccountImplementation].SignMessage;

const SignMessageRequest = () => {
  const [stage, setStage] = useState<
    'verify-deployment' | 'custom-account-screen' | 'sign-confirmation'
  >('verify-deployment');

  const backgroundDispatch = useBackgroundDispatch();
  const [context, setContext] = useState(null);

  const activeAccount = useBackgroundSelector(getActiveAccount);
  const activeNetwork = useBackgroundSelector(getActiveNetwork);

  const accountData = useBackgroundSelector((state) =>
    getAccountEVMData(state, {
      address: activeAccount || '',
      chainId: activeNetwork.chainID,
    })
  );

  useEffect(() => {
    if (activeAccount) {
      backgroundDispatch(getAccountData(activeAccount));
    }
  }, [backgroundDispatch, activeAccount]);

  useEffect(() => {
    if (accountData !== 'loading' && accountData.accountDeployed) {
      setStage('custom-account-screen');
    }
  }, [accountData]);

  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, activeAccount)
  );

  const pendingSigningDataRequest = useBackgroundSelector(
    selectCurrentPendingSignDataRequest
  );

  const originPermission = useBackgroundSelector((state) =>
    selectCurrentOriginPermission(state, {
      origin: pendingSigningDataRequest?.origin || '',
      address: activeAccount || '',
    })
  );

  const onCancel = useCallback(async () => {
    await backgroundDispatch(clearSigningState());
    window.close();
  }, [backgroundDispatch]);

  const onSign = useCallback(async () => {
    await backgroundDispatch(getSignedData(context));
    window.close();
  }, [backgroundDispatch, context]);

  const onComplete = useCallback(
    async (context: any) => {
      setStage('sign-confirmation');
      setContext(context);
    },
    [setContext, setStage]
  );

  if (stage === 'verify-deployment')
    return (
      <DeployAccount
        accountInfo={accountInfo}
        activeAccount={activeAccount}
        originPermission={originPermission}
      />
    );

  if (stage === 'sign-confirmation')
    return (
      <SignConfirmation
        activeAccount={activeAccount}
        originPermission={originPermission}
        accountInfo={accountInfo}
        onCancel={onCancel}
        onSign={onSign}
        pendingSigningDataRequest={pendingSigningDataRequest}
      />
    );

  return SignMessageComponent ? (
    <SignMessageComponent onComplete={onComplete} />
  ) : null;
};

export default SignMessageRequest;
