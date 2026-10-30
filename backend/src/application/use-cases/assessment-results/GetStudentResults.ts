import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IStudentRepository } from '@/domain/repositories/IStudentRepository';
import { IAssessmentResultRepository } from '@/domain/repositories/IAssessmentResultRepository';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
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
    private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(userId: string): Promise<AssessmentResultResponseDTO[]> {
    const student = await this._studentRepo.findByUserId(userId);
    if (!student || student.isDeleted) {
      throw new NotFoundError('Student profile not found.');
    }

    if (!student.batchId) {
      return [];
    }

    // 1. Fetch all schedules for this student's batch
    const batchSchedules = await this._scheduleRepo.findByBatchId(student.batchId);
    const activeSchedules = batchSchedules.filter((s) => !s.isDeleted);

    // 2. Fetch existing results recorded for this student
    const studentResults = await this._resultRepo.findByStudentId(student.id!);
    const resultMap = new Map<string, any>();
    for (const r of studentResults) {
      if (!r.isDeleted) {
        resultMap.set(r.scheduleId, r);
      }
    }

    // 3. Pre-load unique assessment events
    const assessmentCache = new Map<string, any>();
    for (const s of activeSchedules) {
      if (!assessmentCache.has(s.assessmentId)) {
        const assessment = await this._assessmentRepo.findById(s.assessmentId);
        assessmentCache.set(s.assessmentId, assessment);
      }
    }

    // Group schedules by assessmentId to compute total papers and completion
    const schedulesByAssessment = new Map<string, typeof activeSchedules>();
    for (const s of activeSchedules) {
      const assessment = assessmentCache.get(s.assessmentId);
      if (!assessment || assessment.isDeleted) continue;

      if (!schedulesByAssessment.has(s.assessmentId)) {
        schedulesByAssessment.set(s.assessmentId, []);
      }
      schedulesByAssessment.get(s.assessmentId)!.push(s);
    }

    const output: AssessmentResultResponseDTO[] = [];

    for (const [assessmentId, schedules] of schedulesByAssessment.entries()) {
      const assessment = assessmentCache.get(assessmentId);
      if (!assessment) continue;

      const totalExams = schedules.length;
      const completedExams = schedules.filter((s) => s.isGraded).length;
      const publishedExams = schedules.filter((s) => s.isPublished).length;
      const isEventPublished = assessment.status === 'PUBLISHED';
      const allExamsCompleted =
        totalExams > 0 &&
        (isEventPublished || (publishedExams >= totalExams && completedExams >= totalExams));

      for (const s of schedules) {
        const existing = resultMap.get(s.id!);

        // Determine effective status for this exam paper
        let status: 'SCHEDULED' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED';
        if (s.isPublished || (isEventPublished && s.isGraded)) {
          status = 'PUBLISHED';
        } else if (assessment.status === 'COMPLETED' || s.isCompleted || s.isGraded) {
          status = 'COMPLETED';
        } else if (assessment.status === 'CANCELLED') {
          status = 'CANCELLED';
        } else {
          status = 'SCHEDULED';
        }

        const isPublished = status === 'PUBLISHED' && Boolean(existing);

        const formatDate = (d: any) => {
          if (!d) return '';
          const dateObj = new Date(d);
          return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0];
        };

        output.push({
          id: existing?.id || s.id!,
          assessmentId: assessment.id!,
          assessmentName: assessment.name,
          scheduleId: s.id!,
          criteriaId: s.criteriaId,
          criteriaName: s.criteriaName,
          courseId: s.courseId,
          courseName: s.courseName,
          courseCode: s.courseCode,
          levelNumber: s.levelNumber,
          levelName: s.levelName,
          subjectName: s.subjectName || s.criteriaName,
          subjectCode: s.subjectCode,
          batchId: s.batchId,
          batchName: s.batchName || student.batchName,
          studentId: student.id!,
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          admissionNumber: student.admissionNumber,
          studentEmail: student.email,
          maxMarks: existing?.maxMarks ?? 100,
          passMarks: existing?.passMarks ?? 40,
          hasCe: existing?.hasCe ?? false,
          marksObtained: isPublished ? existing?.marksObtained ?? 0 : 0,
          ceMarksObtained: isPublished ? existing?.ceMarksObtained : undefined,
          isAbsent: isPublished ? Boolean(existing?.isAbsent) : false,
          isPassed: isPublished ? Boolean(existing?.isPassed) : false,
          remarks: isPublished ? existing?.remarks : undefined,
          examDate: formatDate(s.examDate),
          startTime: s.startTime,
          endTime: s.endTime,
          centerName: s.centerName,
          scheduleStatus: status,
          isPublished,
          totalExamsInEvent: totalExams,
          completedExamsInEvent: completedExams,
          allExamsCompleted,
          isDeleted: false,
          createdAt: existing?.createdAt || s.createdAt,
          updatedAt: existing?.updatedAt || s.updatedAt,
        });
      }
    }

    return output;
  }
}
