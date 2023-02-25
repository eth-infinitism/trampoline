import { useCallback, useEffect, useState } from 'react';
import { useBackgroundDispatch, useBackgroundSelector } from '../App/hooks';
import { callAccountApiThunk } from '../Background/redux-slices/account';
import {
  getAccountApiCallResult,
  getActiveAccount,
} from '../Background/redux-slices/selectors/accountSelectors';

const useAccountApi = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeAccount = useBackgroundSelector(getActiveAccount);

  const backgroundDispatch = useBackgroundDispatch();

  const { accountApiCallResult, accountApiCallResultState } =
    useBackgroundSelector(getAccountApiCallResult);

  const callAccountApi = useCallback(
    async (functionName: string, args?: any[]) => {
      setLoading(true);
      if (activeAccount) {
        await backgroundDispatch(
          callAccountApiThunk({ address: activeAccount, functionName, args })
        );
      }
    },
    [backgroundDispatch, activeAccount]
  );

  useEffect(() => {
    if (accountApiCallResultState === 'set' && loading) {
      setResult(accountApiCallResult);
      setLoading(false);
    }
  }, [accountApiCallResult, accountApiCallResultState, loading]);

  return {
    result,
    loading,
    callAccountApi,
  };
};

export default useAccountApi;
