export interface DemoResponse {
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
