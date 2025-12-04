import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        toast.error("Session expired. Please login again.");
        
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }

      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error("You don't have permission to perform this action.");
    }

    if (error.response?.status === 404) {
      const errorMessage = 
        error.response.data?.message || 
        error.response.data?.error || 
        "Resource not found";
      toast.error(errorMessage);
    }

    if (error.response?.status === 409) {
      const errorMessage = 
        error.response.data?.message || 
        error.response.data?.error || 
        "Conflict occurred";
      toast.error(errorMessage);
    }

    if (error.response?.status === 422) {
      const errorMessage = 
        error.response.data?.message || 
        error.response.data?.error || 
        "Validation error";
      toast.error(errorMessage);
    }

    if (error.response?.status === 500) {
      toast.error("Server error. Please try again later.");
    }

    if (error.message === "Network Error") {
      toast.error("Network error. Please check your connection.");
    }

    if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please try again.");
    }

    return Promise.reject(error);
  }
);

export const apiHelpers = {
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  isAuthenticated: (): boolean => {
    return !!apiHelpers.getToken();
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setUser: (user: any): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  logout: (): void => {
    apiHelpers.removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  },
};

export const boardApi = {
  getAll: () => api.get("/api/boards"),
  getById: (id: string) => api.get(`/api/boards/${id}`),
  create: (data: { title: string; description?: string }) =>
    api.post("/api/boards", data),
  update: (id: string, data: Partial<{ title: string; description: string }>) =>
    api.patch(`/api/boards/${id}`, data),
  delete: (id: string) => api.delete(`/api/boards/${id}`),
};

export const listApi = {
  create: (data: { boardId: string; title: string }) =>
    api.post("/api/lists", data),
  update: (id: string, data: Partial<{ title: string; position: number }>) =>
    api.patch(`/api/lists/${id}`, data),
  delete: (id: string) => api.delete(`/api/lists/${id}`),
};

export const cardApi = {
  create: (data: { listId: string; title: string; description?: string }) =>
    api.post("/api/cards", data),
  update: (
    id: string,
    data: Partial<{ title: string; description: string; listId: string; position: number }>
  ) => api.patch(`/api/cards/${id}`, data),
  delete: (id: string) => api.delete(`/api/cards/${id}`),
};

export const commentApi = {
  getAll: (cardId: string) => api.get(`/api/comments/card/${cardId}`),
  
  create: (data: { cardId: string; content: string }) =>
    api.post("/api/comments", data),
  
  update: (id: string, data: { content: string }) =>
    api.patch(`/api/comments/${id}`, data),
  
  delete: (id: string) => api.delete(`/api/comments/${id}`),
};


export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),
  me: () => api.get("/api/auth/me"),
  logout: () => {
    apiHelpers.logout();
  },
};

export default api;
