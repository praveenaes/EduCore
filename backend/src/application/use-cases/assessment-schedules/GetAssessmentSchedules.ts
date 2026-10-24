import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IGetAssessmentSchedulesUseCase } from '@/application/ports/use-cases/assessment-schedules/IGetAssessmentSchedulesUseCase';
import {
  AssessmentScheduleQueryDTO,
  AssessmentScheduleListResultDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';

@injectable()
export class GetAssessmentSchedules implements IGetAssessmentSchedulesUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(query: AssessmentScheduleQueryDTO): Promise<AssessmentScheduleListResultDTO> {
    const {
      page = 1,
      limit = 10,
      search,
      assessmentId,
      courseId,
      levelNumber,
      criteriaId,
      batchId,
      centerId,
      isCompleted,
      sortBy,
      sortOrder,
    } = query;

    const result = await this._scheduleRepo.findAll(
      {
        search: search?.trim(),
        assessmentId,
        courseId,
        levelNumber: levelNumber !== undefined ? Number(levelNumber) : undefined,
        criteriaId,
        batchId,
        centerId,
        isCompleted,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    return {
      schedules: result.schedules.map((s) => ({
        id: s.id!,
        assessmentId: s.assessmentId,
        assessmentName: s.assessmentName,
        courseId: s.courseId,
        courseName: s.courseName,
        courseCode: s.courseCode,
        levelNumber: s.levelNumber,
        levelName: s.levelName,
        criteriaId: s.criteriaId,
        criteriaName: s.criteriaName,
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        batchId: s.batchId,
        batchName: s.batchName,
        centerId: s.centerId,
        centerName: s.centerName,
        centerCode: s.centerCode,
        examDate: s.examDate,
        startTime: s.startTime,
        endTime: s.endTime,
        isCompleted: s.isCompleted,
        isDeleted: s.isDeleted,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      total: result.total,
    };
  }
}
