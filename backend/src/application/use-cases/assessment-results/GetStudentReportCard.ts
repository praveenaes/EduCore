import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IAssessmentResultRepository } from '@/domain/repositories/IAssessmentResultRepository';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import {
  IGetStudentReportCardUseCase,
  GetStudentReportCardQuery,
} from '@/application/ports/use-cases/assessment-results/IGetStudentReportCardUseCase';
import {
  StudentReportCardDTO,
  StudentSubjectResultDTO,
} from '@/application/dto/assessments/assessmentResultDtos';
import { calculateLetterGrade } from '@/shared/utils/gradeCalculator';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetStudentReportCard implements IGetStudentReportCardUseCase {
  constructor(
    @inject(TYPES.StudentRepository)
    private _studentRepo: IStudentRepository,
    @inject(TYPES.AssessmentResultRepository)
    private _resultRepo: IAssessmentResultRepository,
    @inject(TYPES.AssessmentRepository)
    private _assessmentRepo: IAssessmentRepository
  ) {}

  async execute(query: GetStudentReportCardQuery): Promise<StudentReportCardDTO> {
    const student = query.userId
      ? await this._studentRepo.findByUserId(query.userId)
      : query.studentId
      ? await this._studentRepo.findById(query.studentId)
      : null;

    if (!student || student.isDeleted) {
      throw new NotFoundError('Student profile not found.');
    }

    const assessment = await this._assessmentRepo.findById(query.assessmentId);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError('Assessment event not found.');
    }

    // If student self-service (requested via userId), ensure results are published
    if (query.userId && assessment.status !== 'PUBLISHED' && assessment.status !== 'COMPLETED') {
      throw new NotFoundError('Results for this assessment have not been published yet.');
    }

    const results = await this._resultRepo.findByStudentAndAssessment(
      student.id!,
      query.assessmentId
    );

    if (!results || results.length === 0) {
      throw new NotFoundError('No results recorded for this assessment.');
    }

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let hasFailedSubject = false;

    const subjects: StudentSubjectResultDTO[] = results.map((r) => {
      const marks = r.marksObtained + (r.ceMarksObtained ?? 0);
      const max = r.maxMarks ?? 100;

      totalMarksObtained += marks;
      totalMaxMarks += max;

      if (!r.isPassed || r.isAbsent) {
        hasFailedSubject = true;
      }

      return {
        criteriaId: r.criteriaId,
        subjectName: r.subjectName || 'Subject',
        subjectCode: r.subjectCode || 'N/A',
        maxMarks: max,
        passMarks: r.passMarks ?? 0,
        hasCe: Boolean(r.hasCe),
        marksObtained: r.marksObtained,
        ceMarksObtained: r.ceMarksObtained,
        isAbsent: r.isAbsent,
        isPassed: r.isPassed,
        grade: calculateLetterGrade(marks, max, r.isAbsent, r.passMarks ?? 40),
        remarks: r.remarks,
      };
    });

    const percentage =
      totalMaxMarks > 0
        ? Math.round((totalMarksObtained / totalMaxMarks) * 100 * 100) / 100
        : 0;

    const firstResult = results[0];
    const overallGrade = hasFailedSubject
      ? 'F'
      : calculateLetterGrade(totalMarksObtained, totalMaxMarks, false, 0);

    return {
      studentId: student.id!,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      admissionNumber: student.admissionNumber,
      assessmentId: assessment.id!,
      assessmentName: assessment.name,
      courseName: firstResult?.courseName,
      levelName: firstResult?.levelName,
      batchName: firstResult?.batchName,
      subjects,
      totalMaxMarks,
      totalMarksObtained,
      percentage,
      overallStatus: hasFailedSubject ? 'FAILED' : 'PASSED',
      overallGrade,
    };
  }
}
