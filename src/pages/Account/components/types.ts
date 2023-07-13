import { UserOperationStruct } from '@account-abstraction/contracts';
import { EthersTransactionRequest } from '../../Background/services/types';

export interface OnboardingComponentProps {
  accountName: string;
  onOnboardingComplete: (context?: any) => void;
}

export interface OnboardingComponent
  extends React.FC<OnboardingComponentProps> {}

export interface TransactionComponentProps {
  transaction: EthersTransactionRequest;
  onComplete(transaction: EthersTransactionRequest, arg: unknown): void;
  onReject(): Promise<void>;
}

export interface PreTransactionConfirmationtProps
  extends TransactionComponentProps {
  onComplete: (
    modifiedTransaction: EthersTransactionRequest,
    context?: any
  ) => Promise<void>;
}

export interface TransactionConfirmationtProps
  extends TransactionComponentProps {
  userOp: UserOperationStruct;
  context: any;
  onComplete: (context?: any) => Promise<void>;
}

export interface PostTransactionConfirmationtProps
  extends TransactionComponentProps {
  userOp: UserOperationStruct;
  context: any;
  onComplete: (context?: any) => Promise<void>;
}

export interface PreTransactionConfirmation
  extends React.FC<PreTransactionConfirmationtProps> {}

export interface TransactionConfirmation
  extends React.FC<TransactionConfirmationtProps> {}

export interface PostTransactionConfirmation
  extends React.FC<PostTransactionConfirmationtProps> {}

export interface TransactionComponent {
  PreTransactionConfirmation: PreTransactionConfirmation;
  TransactionConfirmation: TransactionConfirmation;
  PostTransactionConfirmation: PostTransactionConfirmation;
}

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
