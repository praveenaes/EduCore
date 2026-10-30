import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentResultRepository } from '@/domain/repositories/IAssessmentResultRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { ISaveAssessmentMarksUseCase } from '@/application/ports/use-cases/assessment-results/ISaveAssessmentMarksUseCase';
import {
  SaveAssessmentMarksDTO,
  AssessmentResultResponseDTO,
} from '@/application/dto/assessments/assessmentResultDtos';
import { AssessmentResult } from '@/domain/entities/AssessmentResult';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class SaveAssessmentMarks implements ISaveAssessmentMarksUseCase {
  constructor(
    @inject(TYPES.AssessmentResultRepository)
    private _resultRepo: IAssessmentResultRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository,
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.BatchRepository)
    private _batchRepo: IBatchRepository,
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository
  ) {}

  async execute(dto: SaveAssessmentMarksDTO): Promise<AssessmentResultResponseDTO[]> {
    const schedule = await this._scheduleRepo.findById(dto.scheduleId);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError('Selected assessment schedule not found');
    }

    const assessmentId = dto.assessmentId || schedule.assessmentId;
    const criteriaId = dto.criteriaId || schedule.criteriaId;
    const batchId = dto.batchId || schedule.batchId;

    const criteria = await this._criteriaRepo.findById(criteriaId);
    if (!criteria || criteria.isDeleted) {
      throw new NotFoundError('Selected assessment criteria not found');
    }

    const batch = await this._batchRepo.findById(batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Selected batch not found');
    }

    if (!dto.marks || dto.marks.length === 0) {
      throw new ValidationError('At least one student mark entry is required');
    }

    const maxMarks = criteria.maxMarks;
    const passMarks = criteria.passMarks;

    const resultEntities: AssessmentResult[] = [];

    for (const markItem of dto.marks) {
      const student = await this._studentRepo.findById(markItem.studentId);
      if (!student || student.isDeleted) {
        throw new NotFoundError(`Student with ID "${markItem.studentId}" not found`);
      }

      const isAbsent = Boolean(markItem.isAbsent);
      const marksObtained = isAbsent ? 0 : Number(markItem.marksObtained ?? 0);
      const ceMarksObtained = Number(markItem.ceMarksObtained ?? 0);

      if (marksObtained < 0) {
        throw new ValidationError(
          `Marks cannot be negative for student ${student.firstName} ${student.lastName}`
        );
      }

      if (marksObtained > maxMarks) {
        throw new ValidationError(
          `Marks obtained (${marksObtained}) cannot exceed maximum marks (${maxMarks}) for student ${student.firstName} ${student.lastName}`
        );
      }

      if (ceMarksObtained < 0) {
        throw new ValidationError(
          `CE marks cannot be negative for student ${student.firstName} ${student.lastName}`
        );
      }

      resultEntities.push(
        AssessmentResult.createNew({
          assessmentId,
          scheduleId: dto.scheduleId,
          criteriaId,
          batchId,
          studentId: markItem.studentId,
          marksObtained,
          ceMarksObtained,
          isAbsent,
          passMarks,
          remarks: markItem.remarks?.trim() || '',
        })
      );
    }

    const saved = await this._resultRepo.upsertMany(resultEntities);

    // Mark the exam schedule as completed and graded once marks are saved
    schedule.updateDetails({ isCompleted: true, isGraded: true });
    await this._scheduleRepo.update(schedule.id!, schedule);

    return saved.map((result) => ({
      id: result.id!,
      assessmentId: result.assessmentId,
      assessmentName: result.assessmentName,
      scheduleId: result.scheduleId,
      criteriaId: result.criteriaId,
      criteriaName: result.criteriaName,
      courseId: result.courseId,
      courseName: result.courseName,
      courseCode: result.courseCode,
      levelNumber: result.levelNumber,
      levelName: result.levelName,
      subjectName: result.subjectName,
      subjectCode: result.subjectCode,
      batchId: result.batchId,
      batchName: result.batchName,
      studentId: result.studentId,
      studentName: result.studentName,
      admissionNumber: result.admissionNumber,
      studentEmail: result.studentEmail,
      maxMarks: result.maxMarks,
      passMarks: result.passMarks,
      hasCe: result.hasCe,
      marksObtained: result.marksObtained,
      ceMarksObtained: result.ceMarksObtained,
      isAbsent: result.isAbsent,
      isPassed: result.isPassed,
      remarks: result.remarks,
      isDeleted: result.isDeleted,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));
  }
}
