import {
  GetBatchAttendanceDTO,
  BatchAttendanceResponseDTO,
} from '@/application/dto/attendance/attendanceDtos';

export interface IGetBatchAttendanceUseCase {
  execute(dto: GetBatchAttendanceDTO): Promise<BatchAttendanceResponseDTO>;
}
