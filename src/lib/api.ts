import axios from "axios";

// Configuração base da API
export const API_BASE_URL = "https://calebet-backend.onrender.com";

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
