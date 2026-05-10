const API_URL = '/api';

export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('finepay_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await window.fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Something went wrong');
    }
    return response.json();
  },

  auth: {
    login: (data: any) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  bills: {
    list: () => api.request('/bills'),
    create: (data: any) => api.request('/bills', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => api.request(`/bills/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    fullUpdate: (id: number, data: any) => api.request(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => api.request(`/bills/${id}`, { method: 'DELETE' }),
  },

  stats: {
    get: () => api.request('/stats'),
  }
};
