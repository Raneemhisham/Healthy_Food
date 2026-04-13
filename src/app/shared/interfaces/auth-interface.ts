export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: string;
}