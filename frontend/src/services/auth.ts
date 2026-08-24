import api from './api';
import { setAccessToken } from './tokenStore';
import type { User, TokenResponse } from '../types';

export const authService = {
  async register(data: any): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/register', data);
    setAccessToken(response.data.access_token);
    return response.data;
  },

  async login(data: any): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);
    
    // OAuth2PasswordRequestForm expects form-urlencoded
    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    setAccessToken(response.data.access_token);
    return response.data;
  },

  async googleAuth(code: string): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/google', { code });
    setAccessToken(response.data.access_token);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    setAccessToken(null);
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};
