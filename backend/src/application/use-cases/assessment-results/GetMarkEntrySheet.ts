import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IAssessmentResultRepository } from '@/domain/repositories/IAssessmentResultRepository';
import { IGetMarkEntrySheetUseCase } from '@/application/ports/use-cases/assessment-results/IGetMarkEntrySheetUseCase';
import {
  MarkEntrySheetDTO,
  MarkEntrySheetStudentDTO,
} from '@/application/dto/assessments/assessmentResultDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetMarkEntrySheet implements IGetMarkEntrySheetUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository,
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.BatchRepository)
    private _batchRepo: IBatchRepository,
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository,
    @inject(TYPES.AssessmentResultRepository)
    private _resultRepo: IAssessmentResultRepository
  ) {}

  async execute(scheduleId: string): Promise<MarkEntrySheetDTO> {
    const schedule = await this._scheduleRepo.findById(scheduleId);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError(`Assessment schedule with id "${scheduleId}" not found`);
    }

    const criteria = await this._criteriaRepo.findById(schedule.criteriaId);
    if (!criteria || criteria.isDeleted) {
      throw new NotFoundError('Assessment criteria not found');
    }

    const batch = await this._batchRepo.findById(schedule.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Batch not found');
    }

    const [students, existingResults] = await Promise.all([
      this._studentRepo.findByBatchId(schedule.batchId),
      this._resultRepo.findByScheduleId(scheduleId),
    ]);

    const resultMap = new Map<string, typeof existingResults[0]>();
    for (const res of existingResults) {
      resultMap.set(res.studentId, res);
    }

    // Filter to active, non-deleted students and map with existing marks
    const activeStudents = students.filter((s) => !s.isDeleted && s.isActive);

    const sheetStudents: MarkEntrySheetStudentDTO[] = activeStudents.map((student) => {
      const existing = resultMap.get(student.id!);
      return {
        studentId: student.id!,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber,
        currentResultId: existing?.id,
        marksObtained: existing?.marksObtained,
        ceMarksObtained: existing?.ceMarksObtained,
        isAbsent: existing?.isAbsent ?? false,
        isPassed: existing?.isPassed,
        remarks: existing?.remarks || '',
      };
    });

    return {
      scheduleId: schedule.id!,
      assessmentId: schedule.assessmentId,
      assessmentName: schedule.assessmentName || '',
      courseId: schedule.courseId,
      courseName: schedule.courseName || '',
      levelNumber: schedule.levelNumber,
      batchId: schedule.batchId,
      batchName: schedule.batchName || batch.name,
      criteriaId: schedule.criteriaId,
      criteriaName: schedule.criteriaName || criteria.name,
      subjectName: schedule.subjectName || criteria.subjectName || '',
      maxMarks: criteria.maxMarks,
      passMarks: criteria.passMarks,
      hasCe: criteria.hasCe,
      isCompleted: schedule.isCompleted,
      students: sheetStudents,
    };
  }
}
