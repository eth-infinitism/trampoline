import React, { useEffect } from 'react';
import {
  OnboardingComponent,
  OnboardingComponentProps as Props,
} from '../types';

const Onboarding: OnboardingComponent = ({ onOnboardingComplete }: Props) => {
  useEffect(() => {
    onOnboardingComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <></>;
};

export default Onboarding;
