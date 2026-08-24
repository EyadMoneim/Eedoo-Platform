export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ErrorResponse {
  detail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type TransactionType = 
  | 'PERSONAL_EXPENSE' 
  | 'INCOME' 
  | 'LENT_TO_PERSON' 
  | 'RECEIVED_FROM_PERSON' 
  | 'BORROWED_FROM_PERSON' 
  | 'REPAID_TO_PERSON';

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  icon?: string;
  is_system: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  person_id?: string;
  category_id?: string;
  amount: string;
  currency: string;
  type: TransactionType;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at?: string;
  person?: Person;
  category?: Category;
}

export interface MoneySummary {
  total_income: string;
  total_personal_expenses: string;
  total_lent: string;
  total_received_back: string;
  total_borrowed: string;
  total_repaid: string;
  money_owed_to_user: string;
  money_user_owes: string;
  cash_balance: string;
  net_position: string;
}

export interface PersonSummary {
  person: Person;
  total_lent: string;
  total_received: string;
  total_borrowed: string;
  total_repaid: string;
  current_balance: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

