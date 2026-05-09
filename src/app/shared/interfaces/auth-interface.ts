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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  activityLevel: string;
  goal: string;
  diseaseIds: string[];   // ← string مش number
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  height?: number;
  weight?: number;
  gender?: string;
  activityLevel?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  activityLevel: string;
  diseases: UserDisease[];
}

export interface UserDisease {
  diseaseId: number;
  diseaseName: string;
}

export interface Disease {
  id: number;
  name: string;
}
