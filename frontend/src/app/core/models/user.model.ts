export interface DailyTargets {
  applications: number;
  outreach: number;
  connections: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  dailyTargets: DailyTargets;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}
