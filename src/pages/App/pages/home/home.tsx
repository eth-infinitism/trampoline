import { Box, Card, CardContent, Container } from '@mui/material';
import React from 'react';
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
      <Card sx={{ ml: 4, mr: 4, mt: 2, mb: 2 }}>
        <CardContent>
          {activeAccount && <AccountInfo address={activeAccount}></AccountInfo>}
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ m: 2 }}
          >
            {activeAccount && <AccountBalanceInfo address={activeAccount} />}
          </Box>
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ m: 4 }}
          >
            <TransferAssetButton />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home;
