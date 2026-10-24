import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentResultRepository } from '@/domain/repositories/IAssessmentResultRepository';
import { IGetAssessmentResultsUseCase } from '@/application/ports/use-cases/assessment-results/IGetAssessmentResultsUseCase';
import {
  AssessmentResultQueryDTO,
  AssessmentResultListResultDTO,
  AssessmentResultResponseDTO,
} from '@/application/dto/assessments/assessmentResultDtos';

@injectable()
export class GetAssessmentResults implements IGetAssessmentResultsUseCase {
  constructor(
    @inject(TYPES.AssessmentResultRepository)
    private _resultRepo: IAssessmentResultRepository
  ) {}

  async execute(query: AssessmentResultQueryDTO): Promise<AssessmentResultListResultDTO> {
    const {
      page = 1,
      limit = 10,
      search,
      assessmentId,
      scheduleId,
      criteriaId,
      courseId,
      batchId,
      studentId,
      isAbsent,
      isPassed,
      sortBy,
      sortOrder,
    } = query;

    const result = await this._resultRepo.findAll(
      {
        search: search?.trim(),
        assessmentId,
        scheduleId,
        criteriaId,
        courseId,
        batchId,
        studentId,
        isAbsent,
        isPassed,
      },
      {
        page,
        limit,
        sortBy,
        sortOrder,
      }
    );

    const results: AssessmentResultResponseDTO[] = result.results.map((r) => ({
      id: r.id!,
      assessmentId: r.assessmentId,
      assessmentName: r.assessmentName,
      scheduleId: r.scheduleId,
      criteriaId: r.criteriaId,
      criteriaName: r.criteriaName,
      courseId: r.courseId,
      courseName: r.courseName,
      courseCode: r.courseCode,
      levelNumber: r.levelNumber,
      levelName: r.levelName,
      subjectName: r.subjectName,
      subjectCode: r.subjectCode,
      batchId: r.batchId,
      batchName: r.batchName,
      studentId: r.studentId,
      studentName: r.studentName,
      admissionNumber: r.admissionNumber,
      studentEmail: r.studentEmail,
      maxMarks: r.maxMarks,
      passMarks: r.passMarks,
      hasCe: r.hasCe,
      marksObtained: r.marksObtained,
      ceMarksObtained: r.ceMarksObtained,
      isAbsent: r.isAbsent,
      isPassed: r.isPassed,
      remarks: r.remarks,
      isDeleted: r.isDeleted,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      results,
      total: result.total,
    };
  }
}
