export interface CenterAddress {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Center {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: CenterAddress;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCenterPayload {
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: CenterAddress;
  status?: 'active' | 'inactive';
}

export interface UpdateCenterPayload {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  address?: Partial<CenterAddress>;
  status?: 'active' | 'inactive';
}

export interface CenterListResponse {
  success: boolean;
  message?: string;
  data: {
    centers: Center[];
    total: number;
  };
}
