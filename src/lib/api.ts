import axios, { isAxiosError } from "axios";

// Configuração base da API
// Em desenvolvimento local: http://localhost:8000
// Em produção: https://calebet-backend.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://calebet-backend.onrender.com";

// User ID fixo para desenvolvimento (será substituído por autenticação real depois)
export const DEMO_USER_ID = "user-demo-001";

// Criar instância do Axios com configurações padrão
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos (backend no Render pode ter cold start)
  headers: {
    "Content-Type": "application/json",
  },
});

export const unwrapApiResponse = <T>(payload: unknown): T => {
  if (payload === null || payload === undefined) {
    return payload as T;
  }

  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (typeof payload === "object") {
    const container = payload as Record<string, unknown>;
    for (const key of ["data", "result", "results", "items", "value", "payload"]) {
      if (key in container) {
        return container[key] as T;
      }
    }
  }

  return payload as T;
};

export const requestWithFallback = async <T>(
  requests: Array<() => Promise<T>>
): Promise<T> => {
  let lastError: unknown;

  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      if (!isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("All API requests failed");
};

// Interceptor para logging de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);
