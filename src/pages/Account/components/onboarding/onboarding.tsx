import { CardContent, CircularProgress, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { OnboardingComponent, OnboardingComponentProps } from '../types';

const Onboarding: OnboardingComponent = ({
  accountName,
  onOnboardingComplete,
}: OnboardingComponentProps) => {
  useEffect(() => {
    const listenToMessageEvent = (q_values: any, sender: any) => {
      if (
        sender &&
        sender.url.includes('http://localhost:3000/iframe.html#/create-new')
      ) {
        onOnboardingComplete({
          q_values,
        });
      }
    };

    window.addEventListener('message', listenToMessageEvent);

    chrome.runtime.onMessageExternal.addListener(listenToMessageEvent);

    return () =>
      chrome.runtime.onMessageExternal.removeListener(listenToMessageEvent);
  }, [onOnboardingComplete]);

  useEffect(() => {
    window.open(
      `http://localhost:3000/iframe.html#/create-new/${chrome.runtime.id}/${accountName}/`
    );
  }, [accountName]);

  return (
    <>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Customisable Account Component
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You can show as many steps as you want in this dummy component. You
          need to call the function <b>onOnboardingComplete</b> passed as a
          props to this component. <br />
          <br />
          The function takes a context as a parameter, this context will be
          passed to your AccountApi when creating a new account.
          <br />
          This Component is defined in exported in{' '}
          <pre>trampoline/src/pages/Account/components/onboarding/index.ts</pre>
        </Typography>
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
      </CardContent>
    </>
  );
};

export default Onboarding;
