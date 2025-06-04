export interface LoginResponseDTO {
  userId: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
