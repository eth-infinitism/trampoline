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
    <Center minHeight="100vh" height="100%">
      <BorderBox>
        <HeadTitle>
          Start <br />
          your ETH journey
        </HeadTitle>
        <Center px={4}>
          <img height={250} src={logo} className="App-logo" alt="logo" />
        </Center>
        <Button
          title="Create or Recover new account"
          onClick={() => navigate('/accounts/new')}
        />
      </BorderBox>
    </Center>
  );
};

export default Intro;
