import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IToggleAssessmentScheduleStatusUseCase } from '@/application/ports/use-cases/assessment-schedules/IToggleAssessmentScheduleStatusUseCase';
import { AssessmentScheduleResponseDTO } from '@/application/dto/assessments/assessmentScheduleDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class ToggleAssessmentScheduleStatus implements IToggleAssessmentScheduleStatusUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(id: string): Promise<AssessmentScheduleResponseDTO> {
    const schedule = await this._scheduleRepo.findById(id);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError(`Assessment schedule with id "${id}" not found`);
    }

    schedule.toggleCompleted();
    await this._scheduleRepo.update(id, schedule);

    const updated = await this._scheduleRepo.findById(id);

    return {
      id: updated!.id!,
      assessmentId: updated!.assessmentId,
      assessmentName: updated!.assessmentName,
      courseId: updated!.courseId,
      courseName: updated!.courseName,
      courseCode: updated!.courseCode,
      levelNumber: updated!.levelNumber,
      levelName: updated!.levelName,
      criteriaId: updated!.criteriaId,
      criteriaName: updated!.criteriaName,
      subjectId: updated!.subjectId,
      subjectName: updated!.subjectName,
      subjectCode: updated!.subjectCode,
      batchId: updated!.batchId,
      batchName: updated!.batchName,
      centerId: updated!.centerId,
      centerName: updated!.centerName,
      centerCode: updated!.centerCode,
      examDate: updated!.examDate,
      startTime: updated!.startTime,
      endTime: updated!.endTime,
      isCompleted: updated!.isCompleted,
      isDeleted: updated!.isDeleted,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
