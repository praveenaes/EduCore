import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import {
  IStudentRepository,
  StudentFilters,
  StudentPagination,
} from "@/domain/repositories/IStudentRepository";
import { IGetStudents } from "../../ports/use-cases/students/IGetStudentsUseCase";
import { StudentListResultDTO } from "../../dto/students/studentDtos";

@injectable()
export class GetStudents implements IGetStudents {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(
    filters: StudentFilters,
    pagination: StudentPagination
  ): Promise<StudentListResultDTO> {
    const result = await this._studentRepo.findAll(filters, pagination);

    return {
      students: result.students.map((student) => ({
        id: student.id!,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        admissionDate: student.admissionDate,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        bloodGroup: student.bloodGroup,
        nationalId: student.nationalId,
        photo: student.photo,
        phone: student.phone,
        email: student.email,
        house: student.house,
        area: student.area,
        city: student.city,
        state: student.state,
        postalCode: student.postalCode,
        country: student.country,
        batchId: student.batchId,
        batchName: student.batchName,
        isActive: student.isActive,
        userId: student.userId,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      })),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit) || 1,
    };
  }
}
