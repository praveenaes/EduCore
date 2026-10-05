import {
  CreateBatchAttendanceDTO,
  BatchAttendanceResponseDTO,
} from '@/application/dto/attendance/attendanceDtos';

export interface ICreateBatchAttendanceUseCase {
  execute(dto: CreateBatchAttendanceDTO): Promise<BatchAttendanceResponseDTO>;
}
