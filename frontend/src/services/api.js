import axios from 'axios';

// Initialize Axios client with proxy-friendly base URL
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically injects JWT token into request headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized API Service Endpoints
export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (username, email, password, role) => {
    const response = await API.post('/auth/register', { username, email, password, role });
    return response.data;
  }
};

export const bookService = {
  getAll: async (query = '') => {
    const url = query ? `/books?q=${encodeURIComponent(query)}` : '/books';
    const response = await API.get(url);
    return response.data;
  },
  getById: async (id) => {
    const response = await API.get(`/books/${id}`);
    return response.data;
  },
  create: async (bookData) => {
    const response = await API.post('/books', bookData);
    return response.data;
  },
  update: async (id, bookData) => {
    const response = await API.put(`/books/${id}`, bookData);
    return response.data;
  },
  delete: async (id) => {
    const response = await API.delete(`/books/${id}`);
    return response.data;
  }
};

export const borrowingService = {
  borrow: async (bookId) => {
    const response = await API.post('/borrowings/borrow', { bookId });
    return response.data;
  },
  returnBook: async (borrowingId) => {
    const response = await API.post(`/borrowings/return/${borrowingId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await API.get('/borrowings/stats');
    return response.data;
  },
  getMy: async () => {
    const response = await API.get('/borrowings/my');
    return response.data;
  },
  getAll: async () => {
    const response = await API.get('/borrowings/all');
    return response.data;
  }
};

export const statsService = {
  getTotalBooks: async () => {
    const response = await API.get('/stats/total-books');
    return response.data;
  }
};

export default API;
