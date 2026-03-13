import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetApi, CreateBudgetRequest } from '../api/endpoints/budgets';

export const useBudgets = () => {
    return useQuery({
        queryKey: ['budgets'],
        queryFn: budgetApi.getBudgets,
    });
};

export const useCreateBudget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBudgetRequest) => budgetApi.createBudget(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });
};
