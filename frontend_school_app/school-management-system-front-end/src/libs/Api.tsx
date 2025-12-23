import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:3400',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');

            // Redirect to login (only if not already on login page)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/api/auth/logout');
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/api/auth/get-profile');
        return response.data;
    },

    register: async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) => {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    },

    verify2FA: async (userId: number, token: string) => {
        const response = await api.post('/api/auth/2fa/verify-login', { userId, token });
        return response.data;
    },
};

export default api;
