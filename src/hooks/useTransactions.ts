import { useQuery } from '@tanstack/react-query';
import { transactionApi, TransactionFilters } from '../api/endpoints/transactions';

export const useTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionApi.getTransactions(filters),
  });
};
