import Onboarding from '../../Account/components/onboarding';
import Transaction from '../../Account/components/transaction';
import SignMessage from '../../Account/components/sign-message';
import { AccountImplementationComponentsType } from '../../Account/components/types';
import { ActiveAccountImplementation } from '../../Account';

const AccountImplementation: AccountImplementationComponentsType = {
  Onboarding,
  Transaction,
  SignMessage,
};

const AccountImplementations: {
  [name: string]: AccountImplementationComponentsType;
} = {
  active: AccountImplementation,
};

export { ActiveAccountImplementation, AccountImplementations };
