import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeadTitle } from '../../../../components/HeadTitle';
import { Button } from '../../../../components/Button';
import { BorderBox } from '../../../../components/BorderBox';
import { Center } from '../../../../components/Center';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <Center minHeight="100vh" height="100%" width="60%" marginX="auto">
      <BorderBox>
        <HeadTitle marginBottom="192px">
          Start <br />
          your ETH journey
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
