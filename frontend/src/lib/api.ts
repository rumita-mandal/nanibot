import axios from 'axios';
import { 
  User, 
  WisdomEntry, 
  ChatResponse, 
  FamilyArchiveItem, 
  AdminStats,
  CategoryInfo,
  RegionInfo 
} from '../types';

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://nanibot-backend.onrender.com';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to set dynamic baseURL and add auth token
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nanibot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('nanibot_token', res.data.access_token);
      localStorage.setItem('nanibot_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (email: string, name: string, password: string) => {
    const res = await api.post('/api/auth/register', { email, name, password });
    if (res.data.access_token) {
      localStorage.setItem('nanibot_token', res.data.access_token);
      localStorage.setItem('nanibot_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('nanibot_token');
    localStorage.removeItem('nanibot_user');
  },

  getMe: async (): Promise<User | null> => {
    try {
      const res = await api.get('/api/auth/me');
      return res.data;
    } catch {
      return null;
    }
  },

  getCurrentUserFromStorage: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('nanibot_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const chatApi = {
  sendMessage: async (message: string, sessionId?: string, language: string = 'en'): Promise<ChatResponse> => {
    const res = await api.post('/api/chat/message', {
      message,
      session_id: sessionId,
      language,
    });
    return res.data;
  },

  getHistory: async (sessionId: string) => {
    const res = await api.get(`/api/chat/sessions/${sessionId}/history`);
    return res.data;
  }
};

export const wisdomApi = {
  list: async (params?: { category?: string; region?: string; evidence_label?: string; search?: string; page?: number; per_page?: number }) => {
    const res = await api.get('/api/wisdom', { params });
    return res.data;
  },

  getById: async (id: number): Promise<WisdomEntry> => {
    const res = await api.get(`/api/wisdom/${id}`);
    return res.data;
  },

  getCategories: async (): Promise<CategoryInfo[]> => {
    const res = await api.get('/api/wisdom/categories');
    return res.data;
  },

  getRegions: async (): Promise<RegionInfo[]> => {
    const res = await api.get('/api/wisdom/regions');
    return res.data;
  },

  semanticSearch: async (query: string, category?: string, limit: number = 8) => {
    const res = await api.get('/api/wisdom/search', { params: { q: query, category, limit } });
    return res.data;
  },

  saveWisdom: async (id: number) => {
    const res = await api.post(`/api/wisdom/${id}/save`);
    return res.data;
  },

  unsaveWisdom: async (id: number) => {
    const res = await api.delete(`/api/wisdom/${id}/save`);
    return res.data;
  },

  getSaved: async (page: number = 1) => {
    const res = await api.get('/api/wisdom/user/saved', { params: { page } });
    return res.data;
  }
};

export const contributeApi = {
  submit: async (formData: FormData): Promise<WisdomEntry> => {
    const res = await api.post('/api/contribute', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getMySubmissions: async (): Promise<WisdomEntry[]> => {
    const res = await api.get('/api/contribute/my-submissions');
    return res.data;
  }
};

export const archiveApi = {
  getArchive: async (): Promise<FamilyArchiveItem[]> => {
    const res = await api.get('/api/archive');
    return res.data;
  },

  create: async (formData: FormData): Promise<FamilyArchiveItem> => {
    const res = await api.post('/api/archive', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  deleteItem: async (id: number) => {
    const res = await api.delete(`/api/archive/${id}`);
    return res.data;
  }
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await api.get('/api/admin/stats');
    return res.data;
  },

  getPending: async (page: number = 1) => {
    const res = await api.get('/api/admin/pending', { params: { page } });
    return res.data;
  },

  approve: async (id: number) => {
    const res = await api.post(`/api/admin/wisdom/${id}/approve`);
    return res.data;
  },

  reject: async (id: number, reason?: string) => {
    const res = await api.post(`/api/admin/wisdom/${id}/reject`, null, { params: { reason } });
    return res.data;
  },

  deleteWisdom: async (id: number) => {
    const res = await api.delete(`/api/admin/wisdom/${id}`);
    return res.data;
  }
};
