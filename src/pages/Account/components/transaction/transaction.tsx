import React, { useEffect } from 'react';
import { TransactionComponentProps } from '../types';

// NOTE: This is 「Dummy Account Component」
const Transaction = ({
  transaction,
  onComplete,
}: TransactionComponentProps) => {
  useEffect(() => {
    onComplete(transaction, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default Transaction;
