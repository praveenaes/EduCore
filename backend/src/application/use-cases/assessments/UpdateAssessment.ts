import { inject, injectable } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IAcademicYearRepository } from '@/domain/repositories/IAcademicYearRepository';
import { IUpdateAssessmentUseCase } from '@/application/ports/use-cases/assessments/IUpdateAssessmentUseCase';
import { UpdateAssessmentDTO, AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateAssessment implements IUpdateAssessmentUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository) private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AcademicYearRepository) private _academicYearRepo: IAcademicYearRepository,
    @inject(TYPES.AssessmentScheduleRepository) private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(id: string, dto: UpdateAssessmentDTO): Promise<AssessmentResponseDTO> {
    const assessment = await this._assessmentRepo.findById(id);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError(`Assessment with id "${id}" not found`);
    }

    const academicYearId = dto.academicYearId ?? assessment.academicYearId;
    if (dto.academicYearId && dto.academicYearId !== assessment.academicYearId) {
      const academicYear = await this._academicYearRepo.findById(dto.academicYearId);
      if (!academicYear || academicYear.isDeleted) {
        throw new NotFoundError('Selected academic year not found');
      }
    }

    if (dto.name && dto.name.trim() !== assessment.name) {
      const existing = await this._assessmentRepo.findByName(dto.name, academicYearId);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Assessment "${dto.name}" already exists in this academic year`);
      }
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : assessment.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : assessment.endDate;
    if (startDate > endDate) {
      throw new ValidationError('End date must be on or after start date');
    }

    assessment.updateDetails({
      name: dto.name,
      academicYearId: dto.academicYearId,
      startDate: dto.startDate ? startDate : undefined,
      endDate: dto.endDate ? endDate : undefined,
      status: dto.status,
    });

    await this._assessmentRepo.update(id, assessment);

    if (dto.status === 'COMPLETED') {
      const linkedSchedules = await this._scheduleRepo.findByAssessmentId(id);
      for (const s of linkedSchedules) {
        if (!s.isCompleted) {
          s.updateDetails({ isCompleted: true });
          await this._scheduleRepo.update(s.id!, s);
        }
      }
    }

    const updated = await this._assessmentRepo.findById(id);

    return {
      id: updated!.id!,
      name: updated!.name,
      academicYearId: updated!.academicYearId,
      academicYearName: updated!.academicYearName,
      academicYearCode: updated!.academicYearCode,
      startDate: updated!.startDate,
      endDate: updated!.endDate,
      status: updated!.status,
      isDeleted: updated!.isDeleted,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
