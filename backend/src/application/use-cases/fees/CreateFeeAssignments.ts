import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IFeeAssignmentRepository } from '@/domain/repositories/IFeeAssignmentRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ICreateFeeAssignmentsUseCase } from '@/application/ports/use-cases/fees/ICreateFeeAssignmentsUseCase';
import {
  CreateFeeAssignmentsDTO,
  CreateFeeAssignmentsResponseDTO,
} from '@/application/dto/fees/feeDtos';
import { FeeAssignment } from '@/domain/entities/FeeAssignment';
import { ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateFeeAssignments implements ICreateFeeAssignmentsUseCase {
  constructor(
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository,
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository,
    @inject(TYPES.BatchRepository)
    private _batchRepo: IBatchRepository
  ) {}

  async execute(dto: CreateFeeAssignmentsDTO): Promise<CreateFeeAssignmentsResponseDTO> {
    if (!dto.title || !dto.title.trim()) {
      throw new ValidationError('Fee title is required.');
    }
    if (dto.amount === undefined || dto.amount < 0) {
      throw new ValidationError('A valid fee amount is required.');
    }
    const dueDate = new Date(dto.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new ValidationError('A valid due date is required.');
    }

    const targetStudents: { id: string; userId?: string }[] = [];
    const seenStudentIds = new Set<string>();

    const addStudent = (student: {
      id?: string;
      userId?: string;
      isActive?: boolean;
      isDeleted?: boolean;
    }) => {
      if (
        student.id &&
        !student.isDeleted &&
        student.isActive !== false &&
        !seenStudentIds.has(student.id)
      ) {
        seenStudentIds.add(student.id);
        targetStudents.push({ id: student.id, userId: student.userId });
      }
    };

    if (dto.audience === 'student' && dto.studentIds?.length) {
      for (const studentId of dto.studentIds) {
        const student = await this._studentRepo.findById(studentId);
        if (student) addStudent(student);
      }
    } else if (dto.audience === 'batch' && dto.batchIds?.length) {
      for (const batchId of dto.batchIds) {
        const students = await this._studentRepo.findByBatchId(batchId);
        students.forEach(addStudent);
      }
    } else if (dto.audience === 'center' && dto.centerIds?.length) {
      for (const centerId of dto.centerIds) {
        const batches = await this._batchRepo.findByCenterId(centerId);
        for (const batch of batches) {
          if (batch.id) {
            const students = await this._studentRepo.findByBatchId(batch.id);
            students.forEach(addStudent);
          }
        }
      }
    } else if (dto.audience === 'course' && dto.courseIds?.length) {
      for (const courseId of dto.courseIds) {
        const batches = await this._batchRepo.findByCourseId(courseId);
        for (const batch of batches) {
          if (batch.id) {
            const students = await this._studentRepo.findByBatchId(batch.id);
            students.forEach(addStudent);
          }
        }
      }
    }

    if (targetStudents.length === 0) {
      throw new ValidationError('No active students found matching the selected audience criteria.');
    }

    const feeEntities = targetStudents.map(
      (student) =>
        new FeeAssignment({
          title: dto.title.trim(),
          studentId: student.id,
          userId: student.userId,
          amount: dto.amount,
          dueDate,
          status: 'pending',
          refundStatus: 'none',
          remarks: dto.remarks,
          isDeleted: false,
        })
    );

    const createdAssignments = await this._feeRepo.createBulk(feeEntities);

    return {
      createdCount: createdAssignments.length,
      assignments: createdAssignments.map((assignment) => ({
        id: assignment.id!,
        title: assignment.title,
        studentId: assignment.studentId,
        userId: assignment.userId,
        amount: assignment.amount,
        dueDate: assignment.dueDate,
        status: assignment.status,
        refundStatus: assignment.refundStatus,
        refundReason: assignment.refundReason,
        remarks: assignment.remarks,
        isDeleted: assignment.isDeleted,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      })),
    };
  }
}
