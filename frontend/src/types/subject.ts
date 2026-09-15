export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  createdAt?: string;
}

export interface SubjectListResponse {
  success: boolean;
  data: {
    subjects: Subject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateSubjectPayload {
  name: string;
  code: string;
  description: string;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;
