export interface OnboardingComponentProps {
  onOnboardingComplete: (context?: any) => void;
}

export interface OnboardingComponent
  extends React.FC<OnboardingComponentProps> {}

export interface TransactionComponentProps {}

export interface TransactionComponent
  extends React.FC<TransactionComponentProps> {}

export interface AccountImplementationComponentsType {
  Onboarding?: OnboardingComponent;
  Transaction?: TransactionComponent;
}
