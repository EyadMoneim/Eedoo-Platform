import api from './api';
import type { 
  Transaction, Category, Person, MoneySummary, PersonSummary, PaginatedResponse
} from '../types';

export const moneyService = {
  // --- Transactions ---
  async getTransactions(params?: {
    page?: number;
    size?: number;
    type?: string;
    category_id?: string;
    person_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get<PaginatedResponse<Transaction>>('/money/transactions', { params });
    return response.data;
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/money/transactions/${id}`);
    return response.data;
  },

  async createTransaction(data: any): Promise<Transaction> {
    const response = await api.post<Transaction>('/money/transactions', data);
    return response.data;
  },

  async updateTransaction(id: string, data: any): Promise<Transaction> {
    const response = await api.patch<Transaction>(`/money/transactions/${id}`, data);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/money/transactions/${id}`);
  },

  // --- People ---
  async getPeople(): Promise<Person[]> {
    const response = await api.get<Person[]>('/money/people');
    return response.data;
  },

  async getPerson(id: string): Promise<Person> {
    const response = await api.get<Person>(`/money/people/${id}`);
    return response.data;
  },

  async createPerson(data: any): Promise<Person> {
    const response = await api.post<Person>('/money/people', data);
    return response.data;
  },

  async updatePerson(id: string, data: any): Promise<Person> {
    const response = await api.patch<Person>(`/money/people/${id}`, data);
    return response.data;
  },

  async deletePerson(id: string): Promise<void> {
    await api.delete(`/money/people/${id}`);
  },

  async getPersonSummary(id: string): Promise<PersonSummary> {
    const response = await api.get<PersonSummary>(`/money/people/${id}/summary`);
    return response.data;
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/money/categories');
    return response.data;
  },

  async createCategory(data: any): Promise<Category> {
    const response = await api.post<Category>('/money/categories', data);
    return response.data;
  },

  async updateCategory(id: string, data: any): Promise<Category> {
    const response = await api.patch<Category>(`/money/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/money/categories/${id}`);
  },

  // --- Summary ---
  async getMoneySummary(): Promise<MoneySummary> {
    const response = await api.get<MoneySummary>('/money/summary');
    return response.data;
  }
};
