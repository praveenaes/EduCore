export interface AcademicYearCenter {
  id: string;
  name?: string;
  code?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  current: boolean;
  centers: (AcademicYearCenter | string)[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicYearPayload {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  centers?: string[];
}

export interface UpdateAcademicYearPayload {
  name?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  centers?: string[];
}

export interface AcademicYearFormData {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  current: boolean;
  centers: string[];
}

export interface AcademicYearListResponse {
  success: boolean;
  message?: string;
  data: {
    academicYears: AcademicYear[];
    total: number;
  };
}
