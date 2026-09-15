export interface CreateSubjectDTO {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubjectDTO {
  name?: string;
  code?: string;
  description?: string;
}

export interface SubjectResponseDTO {
  id: string;
  name: string;
  code: string;
  description: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubjectListResultDTO {
  subjects: SubjectResponseDTO[];
  total: number;
}
