import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository, StudentFilters } from "@/domain/repositories/IStudentRepository";
import { Student } from "../../../domain/entities/Student";

import { IGetStudents } from "../../ports/use-cases/students/IGetStudentsUseCase";

import { PaginationHelper } from "@/shared/utils/pagination";

export interface GetStudentsRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
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
    
    const filters: StudentFilters = { 
      search: req.search?.trim() || undefined
    };
    const sortBy = req.sortBy;
    const sortOrder = req.sortOrder as 'asc' | 'desc' | undefined;

    const result = await this.studentRepository.findAll(filters, { 
      page, 
      limit, 
      sortBy, 
      sortOrder,
    });

    return PaginationHelper.toPaginatedResult(
      "students",
      result.students,
      result.total,
      page,
      limit
    ) as GetStudentsResponse
  }
}
