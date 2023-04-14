import React from 'react';
import { Center } from '../../../../components/Center';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import AccountBalanceInfo from '../../components/account-balance-info';
import AccountInfo from '../../components/account-info';
import Header from '../../components/header';
import TransferAssetButton from '../../components/transfer-asset-button';
import { useBackgroundSelector } from '../../hooks';

const Home = () => {
  const activeAccount = useBackgroundSelector(getActiveAccount);

  return (
    <Center minHeight="100vh" height="100%" width="60%" marginX="auto">
      <Header mb={2} />
      {activeAccount && (
        <AccountInfo mb={2} address={activeAccount} showOptions={false} />
      )}
      <AccountBalanceInfo mb={2} address={activeAccount || ''} />
      <TransferAssetButton activeAccount={activeAccount || ''} />
    </Center>
  );
};

export default Home;
