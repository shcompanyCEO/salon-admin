export interface RegisterOwnerParams {
  email: string;
  password: string;
  name: string;
  salonName: string;
  phone: string;
  industryNames: string[];
}

export interface CheckDuplicateParams {
  type: 'email' | 'salonName';
  value: string;
}

export interface CheckDuplicateResponse {
  available: boolean;
  message?: string;
}

export type CheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';
