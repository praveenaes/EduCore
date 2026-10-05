import {
  GetStudentAttendanceDTO,
  StudentMonthlyAttendanceResponseDTO,
} from '@/application/dto/attendance/attendanceDtos';

export interface IGetStudentAttendanceUseCase {
  execute(dto: GetStudentAttendanceDTO): Promise<StudentMonthlyAttendanceResponseDTO>;
}
