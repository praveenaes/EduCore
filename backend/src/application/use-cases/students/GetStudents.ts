import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository, StudentFilters } from "../../ports/repositories/IStudentRepository";
import { Student } from "../../../domain/entities/Student";

import { IGetStudents } from "../../ports/use-cases/students/IGetStudentsUseCase";

export interface GetStudentsRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@injectable()
export class GetStudents implements IGetStudents {
  constructor(
    @inject(TYPES.StudentRepository) private studentRepository: IStudentRepository
  ) {}

  async execute(req: GetStudentsRequest): Promise<GetStudentsResponse> {
    const page = Math.max(1, req.page ?? 1);
    const limit = Math.max(1, req.limit ?? 5)
    const filters: StudentFilters = { search: req.search?.trim() || undefined };

    const result = await this.studentRepository.findAll(filters, { page, limit });

    return {
      students: result.students,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
