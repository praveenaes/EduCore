import {
  UpdateBatchAttendanceDTO,
  BatchAttendanceResponseDTO,
} from '@/application/dto/attendance/attendanceDtos';

export interface IUpdateBatchAttendanceUseCase {
  execute(dto: UpdateBatchAttendanceDTO): Promise<BatchAttendanceResponseDTO>;
}
