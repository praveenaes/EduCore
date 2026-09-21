import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import {
  ITeacherRepository,
  TeacherFilters,
  TeacherPagination,
} from "@/domain/repositories/ITeacherRepository";
import { IGetTeachers } from "../../ports/use-cases/teachers/IGetTeachersUseCase";
import { TeacherListResultDTO } from "../../dto/teachers/teacherDtos";

@injectable()
export class GetTeachers implements IGetTeachers {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(
    filters: TeacherFilters,
    pagination: TeacherPagination
  ): Promise<TeacherListResultDTO> {
    const result = await this._teacherRepo.findAll(filters, pagination);

    return {
      teachers: result.teachers.map((teacher) => ({
        id: teacher.id!,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        employeeId: teacher.employeeId,
        joiningDate: teacher.joiningDate,
        qualifications: teacher.qualifications,
        specializations: teacher.specializations,
        experience: teacher.experience,
        salary: teacher.salary,
        gender: teacher.gender,
        dateOfBirth: teacher.dateOfBirth,
        bloodGroup: teacher.bloodGroup,
        nationalId: teacher.nationalId,
        photo: teacher.photo,
        phone: teacher.phone,
        email: teacher.email,
        house: teacher.house,
        area: teacher.area,
        city: teacher.city,
        state: teacher.state,
        postalCode: teacher.postalCode,
        country: teacher.country,
        isDeleted: teacher.isDeleted,
        isActive: teacher.isActive,
        userId: teacher.userId,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
      })),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit) || 1,
    };
  }
}
