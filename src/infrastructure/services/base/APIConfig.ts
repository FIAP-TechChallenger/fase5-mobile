import axios from "axios";
import { UserTokenService } from "./UserTokenService";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição
api.interceptors.request.use(
  async (config) => {
    const token = await UserTokenService.getInstance().get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);
    if (error.response?.status === 401) {
      console.warn("Token expirado ou inválido");
      // aqui você poderia, por exemplo, redirecionar para login
    }
    return Promise.reject(error);
  }
);

export { api };
