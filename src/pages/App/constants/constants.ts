import Onboarding from '../../Account/components/onboarding';
import Transaction from '../../Account/components/transaction';
import { AccountImplementationComponentsType } from '../../Account/components/types';
import { ActiveAccountImplementation } from '../../Account';

const AccountImplementation: AccountImplementationComponentsType = {
  Onboarding,
  Transaction,
};

const AccountImplementations: {
  [name: string]: AccountImplementationComponentsType;
} = {
  active: AccountImplementation,
};

export { ActiveAccountImplementation, AccountImplementations };
