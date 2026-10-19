import { useCallback, useState } from 'react';
import { ApiError } from '../../../shared/api/http';
import { createTransaction, updateTransaction, voidTransaction } from '../api/transactions';
import type { Transaction, TransactionInput } from '../api/contract';

function requireToken(token: string | undefined): string {
  if (!token) throw new ApiError('unauthenticated');
  return token;
}

export function useTransactionMutations(
  token: string | undefined,
  expire: (token: string) => void,
  onChanged: () => void,
) {
  const [pendingMutations, setPendingMutations] = useState(0);

  const mutate = useCallback(async <T,>(operation: () => Promise<T>) => {
    if (!token) throw new ApiError('unauthenticated');
    setPendingMutations(value => value + 1);
    try {
      const value = await operation();
      onChanged();
      return value;
    } catch (error) {
      if (error instanceof ApiError && error.kind === 'unauthenticated') expire(token);
      throw error;
    } finally {
      setPendingMutations(value => Math.max(0, value - 1));
    }
  }, [token, expire, onChanged]);

  const save = useCallback((value: TransactionInput, id?: string): Promise<Transaction> => (
    id
      ? mutate(() => updateTransaction(requireToken(token), id, value))
      : mutate(() => createTransaction(requireToken(token), value))
  ), [token, mutate]);
  const voidMovement = useCallback((id: string) => mutate(() => voidTransaction(requireToken(token), id)), [token, mutate]);

  return { save, voidMovement, isMutating: pendingMutations > 0 };
}
