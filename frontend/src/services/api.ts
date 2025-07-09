import axios from 'axios';
import { AuthResponse, User, Tool, BorrowRequest, ApiResponse, NotificationData, Stats } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: {
    username: string;
    email: string;
    phone: string;
    block_no: string;
    house_no: string;
    password: string;
    confirm_password: string;
  }): Promise<AuthResponse> =>
    api.post('/auth/signup/', data).then(res => res.data),

  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login/', { email, password }).then(res => res.data),

  logout: (): Promise<{ message: string }> =>
    api.post('/auth/logout/').then(res => res.data),

  getUserInfo: (): Promise<User> =>
    api.get('/auth/user/').then(res => res.data),
};

// Tools API
export const toolsAPI = {
  getTools: (page?: number): Promise<ApiResponse<Tool>> =>
    api.get(`/tools/${page ? `?page=${page}` : ''}`).then(res => res.data),

  getMyTools: (): Promise<Tool[]> =>
    api.get('/tools/my-tools/').then(res => res.data),

  createTool: (formData: FormData): Promise<Tool> =>
    api.post('/tools/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),

  updateTool: (id: number, formData: FormData): Promise<Tool> =>
    api.put(`/tools/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),

  deleteTool: (id: number): Promise<{ message: string }> =>
    api.delete(`/tools/${id}/`).then(res => res.data),

  getToolStats: (): Promise<Stats> =>
    api.get('/tools/stats/').then(res => res.data),
};


// Requests API
export const requestsAPI = {
  getMyRequests: (page?: number): Promise<ApiResponse<BorrowRequest>> =>
    api.get(`/requests/${page ? `?page=${page}` : ''}`).then(res => res.data),

  getIncomingRequests: (page?: number): Promise<ApiResponse<BorrowRequest>> =>
    api.get(`/requests/incoming/${page ? `?page=${page}` : ''}`).then(res => res.data),

  createRequest: (data: {
    tool_id: number;
    reason: string;
    duration: number;
  }): Promise<BorrowRequest> =>
    api.post('/requests/', data).then(res => res.data),

  approveRequest: (id: number): Promise<{ message: string; request: BorrowRequest }> =>
    api.post(`/requests/${id}/approve/`).then(res => res.data),

  rejectRequest: (id: number): Promise<{ message: string; request: BorrowRequest }> =>
    api.post(`/requests/${id}/reject/`).then(res => res.data),

  markReturned: (id: number): Promise<{ message: string; request: BorrowRequest }> =>
    api.post(`/requests/${id}/returned/`).then(res => res.data),

  getRequestStats: (): Promise<Stats> =>
    api.get('/requests/stats/').then(res => res.data),

  getNotifications: (): Promise<NotificationData> =>
    api.get('/requests/notifications/').then(res => res.data),

  markNotificationsRead: (): Promise<{ message: string }> =>
    api.post('/requests/notifications/read/').then(res => res.data),

getMyBorrowedTools: (): Promise<ApiResponse<BorrowRequest>> =>
  api.get('/requests/borrowed/').then(res => res.data),


  getLentTools: (): Promise<ApiResponse<BorrowRequest>> =>
  api.get('/requests/lent/').then(res => res.data),
};

export default api;