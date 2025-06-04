import { AuthApiService } from "@/infrastructure/services/AuthApiService";

export class AuthService {
  static async login(email: string, password: string) {
    return AuthApiService.signIn(email, password);
  }

  static async logout() {
    await AuthApiService.signOut();
  }
}
