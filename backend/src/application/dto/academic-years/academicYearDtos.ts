export interface CreateAcademicYearDTO {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  centers?: string[];
}

export interface UpdateAcademicYearDTO {
  name?: string;
  code?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  centers?: string[];
}

export interface AcademicYearCenterDTO {
  id: string;
  name?: string;
  code?: string;
}

export interface AcademicYearResponseDTO {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  current: boolean;
  centers: (AcademicYearCenterDTO | string)[];
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicYearListResultDTO {
  academicYears: AcademicYearResponseDTO[];
  total: number;
}

export interface AcademicYearQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  centerId?: string;
  current?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
