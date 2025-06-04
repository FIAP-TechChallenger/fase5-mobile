import { api } from "./APIConfig";

export class HttpClient {
  static async post<TRequest extends object, TResponse = any>(
    method: string,
    body?: TRequest
  ): Promise<TResponse> {
    try {
      const response = await api.post<TResponse>(method, body);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async get<TResponse = any>(method: string): Promise<TResponse> {
    try {
      const response = await api.get<TResponse>(method);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
