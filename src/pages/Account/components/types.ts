import { UserOperationStruct } from '@account-abstraction/contracts';
import { EthersTransactionRequest } from '../../Background/services/provider-bridge';

export interface OnboardingComponentProps {
  onOnboardingComplete: (context?: any) => void;
}

export interface OnboardingComponent
  extends React.FC<OnboardingComponentProps> {}

export interface TransactionComponentProps {
  transaction: EthersTransactionRequest;
  onComplete: (
    modifiedTransaction: EthersTransactionRequest,
    context?: any
  ) => Promise<void>;
}

export interface TransactionComponent
  extends React.FC<TransactionComponentProps> {}

export interface SignMessageComponenetProps {
  onComplete: (context?: any) => Promise<void>;
}

export interface SignMessageComponenet
  extends React.FC<SignMessageComponenetProps> {}

export interface AccountImplementationComponentsType {
  Onboarding?: OnboardingComponent;
  Transaction?: TransactionComponent;
  SignMessage?: SignMessageComponenet;
}
