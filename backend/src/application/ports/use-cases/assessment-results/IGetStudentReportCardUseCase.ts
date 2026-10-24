import { StudentReportCardDTO } from '@/application/dto/assessments/assessmentResultDtos';

export interface GetStudentReportCardQuery {
  userId?: string;
  studentId?: string;
  assessmentId: string;
}

export interface IGetStudentReportCardUseCase {
  execute(query: GetStudentReportCardQuery): Promise<StudentReportCardDTO>;
}
