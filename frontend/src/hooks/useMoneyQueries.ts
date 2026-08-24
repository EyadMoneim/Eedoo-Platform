import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moneyService } from '../services/moneyService';

// --- Transactions ---
export const useTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => moneyService.getTransactions(params)
  });
};

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => moneyService.getTransaction(id),
    enabled: !!id
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => moneyService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['moneySummary'] });
      queryClient.invalidateQueries({ queryKey: ['personSummary'] });
    }
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => moneyService.updateTransaction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['moneySummary'] });
      queryClient.invalidateQueries({ queryKey: ['personSummary'] });
    }
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moneyService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['moneySummary'] });
      queryClient.invalidateQueries({ queryKey: ['personSummary'] });
    }
  });
};

// --- People ---
export const usePeople = () => {
  return useQuery({
    queryKey: ['people'],
    queryFn: () => moneyService.getPeople()
  });
};

export const usePersonSummary = (id: string) => {
  return useQuery({
    queryKey: ['personSummary', id],
    queryFn: () => moneyService.getPersonSummary(id),
    enabled: !!id
  });
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => moneyService.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => moneyService.updatePerson(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['personSummary', variables.id] });
    }
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => moneyService.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
};

// --- Categories ---
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => moneyService.getCategories()
  });
};

// --- Summary ---
export const useMoneySummary = () => {
  return useQuery({
    queryKey: ['moneySummary'],
    queryFn: () => moneyService.getMoneySummary()
  });
};
