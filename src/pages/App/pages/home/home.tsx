import { Container } from '@mui/material';
import React from 'react';
import { Center } from '../../../../components/Center';
import { ShadowBox } from '../../../../components/ShadowBox';
import { getActiveAccount } from '../../../Background/redux-slices/selectors/accountSelectors';
import AccountBalanceInfo from '../../components/account-balance-info';
import AccountInfo from '../../components/account-info';
import Header from '../../components/header';
import TransferAssetButton from '../../components/transfer-asset-button';
import { useBackgroundSelector } from '../../hooks';

const Home = () => {
  const activeAccount = useBackgroundSelector(getActiveAccount);

  return (
    <Container sx={{ width: '62vw', height: '100vh' }}>
      <Header />
      <ShadowBox>
        {activeAccount && (
          <AccountInfo address={activeAccount} showOptions={false} />
        )}
        <Center margin={4}>
          <AccountBalanceInfo address={activeAccount || ''} />
        </Center>
        <Center margin={4}>
          <TransferAssetButton activeAccount={activeAccount || ''} />
        </Center>
      </ShadowBox>
    </Container>
  );
};

export default Home;
