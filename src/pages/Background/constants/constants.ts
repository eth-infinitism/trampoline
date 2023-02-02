import AccountApi from '../../Account/account-api';
import { AccountImplementationType } from '../../Account/account-api/types';
import { ActiveAccountImplementation } from '../../Account/';

console.log(AccountApi, '-----', AccountApi);

const AccountImplementation: AccountImplementationType = AccountApi;

const AccountImplementations: {
  [name: string]: AccountImplementationType;
} = {
  [ActiveAccountImplementation]: AccountImplementation,
};

export { ActiveAccountImplementation, AccountImplementations };
