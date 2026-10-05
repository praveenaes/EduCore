import { TeacherInChargeBatchDTO } from './teacherCurriculumDtos';

export { TeacherInChargeBatchDTO };

export interface TeacherBatchListResultDTO {
  batches: TeacherInChargeBatchDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
