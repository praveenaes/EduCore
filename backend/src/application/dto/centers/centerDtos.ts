export interface CreateCenterDTO {
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status?: 'active' | 'inactive';
}

export interface UpdateCenterDTO {
  name?: string;
  code?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  address?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status?: 'active' | 'inactive';
}

export interface CenterResponseDTO {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CenterListQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
