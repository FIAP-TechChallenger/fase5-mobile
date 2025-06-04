import { CriarUsuarioDTO } from "../dtos/CriarUsuarioDTO";
import { HttpClient } from "./base/HttpClient";

export class UsuarioApiService {
  static async cadastrar(email: string, password: string): Promise<boolean> {
    try {
      await HttpClient.post<CriarUsuarioDTO, void>("user/register", {
        email,
        password,
      });
      return true;
    } catch (error: any) {
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao tentar cadastrar usuario");
    }
  }
}
