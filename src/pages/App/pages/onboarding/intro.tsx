import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeadTitle } from '../../../../components/HeadTitle';
import { Button } from '../../../../components/Button';
import { BorderBox } from '../../../../components/BorderBox';
import { Center } from '../../../../components/Center';
import logo from '../../../../assets/img/logo.svg';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <Center minHeight="100vh" height="100%" width="60%" marginX="auto">
      <BorderBox>
        <img height={48} src={logo} className="App-logo" alt="logo" />
        <HeadTitle marginTop="20px" marginBottom="96px">
          Beautifully friendly <br />
          crypto wallet.
        </HeadTitle>
        <Button
          sx={{ marginRight: 'auto' }}
          title="Create New Account"
          onClick={() => navigate('/accounts/new')}
        />
      </BorderBox>
    </Center>
  );
};

export default Intro;
