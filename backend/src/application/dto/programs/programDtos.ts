export interface CreateProgramDTO {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateProgramDTO {
  name?: string;
  code?: string;
  description?: string;
}

export interface ProgramResponseDTO {
  id: string;
  name: string;
  code: string;
  description?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProgramListResultDTO {
  programs: ProgramResponseDTO[];
  total: number;
}