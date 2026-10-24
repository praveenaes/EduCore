import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IAssessmentResultRepository } from '@/domain/repositories/IAssessmentResultRepository';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IGetStudentResultsUseCase } from '@/application/ports/use-cases/assessment-results/IGetStudentResultsUseCase';
import { AssessmentResultResponseDTO } from '@/application/dto/assessments/assessmentResultDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetStudentResults implements IGetStudentResultsUseCase {
  constructor(
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository,
    @inject(TYPES.AssessmentResultRepository)
    private _resultRepo: IAssessmentResultRepository,
    @inject(TYPES.AssessmentRepository)
    private _assessmentRepo: IAssessmentRepository
  ) {}

  async execute(userId: string): Promise<AssessmentResultResponseDTO[]> {
    const student = await this._studentRepo.findByUserId(userId);
    if (!student || student.isDeleted) {
      throw new NotFoundError('Student profile not found.');
    }

    // Fetch all results for this student
    const allResults = await this._resultRepo.findByStudentId(student.id!);

    // Filter to only results from PUBLISHED or COMPLETED assessment events
    const publishedResults: AssessmentResultResponseDTO[] = [];
    const assessmentCache = new Map<string, any>();

    for (const r of allResults) {
      let assessment = assessmentCache.get(r.assessmentId);
      if (assessment === undefined) {
        assessment = await this._assessmentRepo.findById(r.assessmentId);
        assessmentCache.set(r.assessmentId, assessment);
      }

      if (
        !assessment ||
        assessment.isDeleted ||
        (assessment.status !== 'PUBLISHED' && assessment.status !== 'COMPLETED')
      ) {
        continue;
      }

      publishedResults.push({
        id: r.id!,
        assessmentId: r.assessmentId,
        assessmentName: assessment.name,
        scheduleId: r.scheduleId,
        criteriaId: r.criteriaId,
        criteriaName: r.criteriaName,
        courseId: r.courseId,
        courseName: r.courseName,
        courseCode: r.courseCode,
        levelNumber: r.levelNumber,
        levelName: r.levelName,
        subjectName: r.subjectName || r.criteriaName,
        subjectCode: r.subjectCode,
        batchId: r.batchId,
        batchName: r.batchName,
        studentId: r.studentId,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber,
        studentEmail: student.email,
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
      });
    }

    return publishedResults;
  }
}
