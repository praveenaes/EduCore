export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
}

export interface ProgramListResponse {
  success: boolean;
  data: {
    programs: Program[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProgramPayload {
  name: string;
  code: string;
  description?: string;
}

export type UpdateProgramPayload = Partial<CreateProgramPayload>;