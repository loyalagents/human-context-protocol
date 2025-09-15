export interface GatewayResponse<T = any> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PreferenceResponse {
  id: string;
  userId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreferenceRequest {
  userId: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
}

export interface UpdatePreferenceRequest {
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'object';
}