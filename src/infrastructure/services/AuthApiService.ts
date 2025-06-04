import { LoginDTO } from "../dtos/LoginDTO";
import { LoginResponseDTO } from "../dtos/LoginResponseDTO";
import { HttpClient } from "./base/HttpClient";
import { UserTokenService } from "./base/UserTokenService";

export class AuthApiService {
  static async signIn(email: string, password: string): Promise<string> {
    try {
      const response = await HttpClient.post<LoginDTO, LoginResponseDTO>(
        "auth/login",
        { email, password }
      );

      UserTokenService.getInstance().set(response.token);
      return response.userId;
    } catch (error: any) {
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao tentar fazer login");
    }
  }

  static async signOut(): Promise<void> {
    try {
      await HttpClient.post("auth/logout");
    } catch (error: any) {
      return;
    }
  }
}
