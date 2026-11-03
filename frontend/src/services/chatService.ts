import api from './api';

export interface ChatLine {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  reply: string;
  action: 'expense' | 'income' | 'lent' | 'received' | 'borrowed' | 'repaid' | 'reminder' | 'question';
  record_id?: string;
}

export interface Reminder {
  id: string;
  title: string;
  event_at: string;
  remind_at: string;
}

export const chatService = {
  async send(message: string, history: ChatLine[]): Promise<ChatResult> {
    const response = await api.post<ChatResult>('/chat/message', { message, history: history.slice(-4) });
    return response.data;
  },
  async reminders(): Promise<Reminder[]> {
    const response = await api.get<Reminder[]>('/chat/reminders');
    return response.data;
  },
  async deleteReminder(id: string): Promise<void> {
    await api.delete(`/chat/reminders/${id}`);
  },
};
