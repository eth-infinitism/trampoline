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
        sender.url.includes('http://localhost:8080/iframe.html#/create-new')
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
      `http://localhost:8080/iframe.html#/create-new/${chrome.runtime.id}/${accountName}/`
    );
  }, [accountName]);

  return (
    <>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Awaiting Fingerprint
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
