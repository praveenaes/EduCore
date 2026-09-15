import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository, TeacherFilters } from "@/domain/repositories/ITeacherRepository";
import { Teacher } from "../../../domain/entities/Teacher";

import { PaginationHelper } from "@/shared/utils/pagination";
import { IGetTeachers } from "../../ports/use-cases/teachers/IGetTeachersUseCase";

export interface GetTeachersRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetTeachersResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@injectable()
export class GetTeachers implements IGetTeachers {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(req: GetTeachersRequest): Promise<GetTeachersResponse> {
    const page = Math.max(1, req.page ?? 1);
    const limit = Math.min(100, Math.max(1, req.limit ?? 10));
    const filters: TeacherFilters = { search: req.search?.trim() || undefined };
    const sortBy = req.sortBy;
    const sortOrder = req.sortOrder as 'asc' | 'desc' | undefined;

    const result = await this._teacherRepo.findAll(filters, { 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    });

    return PaginationHelper.toPaginatedResult(
      "teachers",
      result.teachers,
      result.total,
      page,
      limit
    ) as GetTeachersResponse
  }
}
